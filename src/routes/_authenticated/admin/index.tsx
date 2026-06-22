import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Coffee,
} from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminMetricsQuery, adminOrdersQuery } from "@/lib/admin";
import { formatIDR } from "@/lib/format";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Dashboard" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery(adminMetricsQuery());
  const { data: recent } = useQuery(adminOrdersQuery());
  const recent10 = (recent ?? []).slice(0, 10);
  const maxRev = Math.max(1, ...((metrics?.revenue_series_30d ?? []).map((d) => d.revenue)));

  return (
    <AdminLayout title="Dashboard">
      <AdminMobileNav />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Revenue hari ini"
          value={isLoading ? "…" : formatIDR(metrics?.revenue_today ?? 0)}
          icon={TrendingUp}
        />
        <Stat
          label="Revenue 7 hari"
          value={isLoading ? "…" : formatIDR(metrics?.revenue_7d ?? 0)}
          icon={TrendingUp}
        />
        <Stat
          label="Revenue 30 hari"
          value={isLoading ? "…" : formatIDR(metrics?.revenue_30d ?? 0)}
          icon={TrendingUp}
        />
        <Stat
          label="Total pesanan"
          value={isLoading ? "…" : String(metrics?.orders_count ?? 0)}
          icon={ShoppingCart}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          to="/admin/pembayaran"
          icon={CreditCard}
          count={metrics?.pending_verification ?? 0}
          label="Menunggu verifikasi"
          tone={metrics?.pending_verification ? "warn" : "neutral"}
        />
        <ActionCard
          to="/admin/produk"
          icon={AlertTriangle}
          count={metrics?.low_stock ?? 0}
          label="Stok menipis"
          tone={metrics?.low_stock ? "warn" : "neutral"}
        />
        <ActionCard
          to="/admin/pelanggan"
          icon={UserPlus}
          count={metrics?.new_customers_7d ?? 0}
          label="Pelanggan baru 7 hari"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-display text-lg text-[color:var(--coffee)]">Revenue 30 hari</h3>
            <span className="text-xs text-[color:var(--muted-foreground)]">harian</span>
          </div>
          <div className="flex items-end gap-1 h-40">
            {(metrics?.revenue_series_30d ?? []).map((d) => (
              <div
                key={d.day}
                className="flex-1 rounded-t bg-[color:var(--coffee)]/70 hover:bg-[color:var(--coffee)] transition-colors"
                style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: 2 }}
                title={`${d.day}: ${formatIDR(d.revenue)}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <h3 className="font-display text-lg text-[color:var(--coffee)] mb-4">Top produk 30 hari</h3>
          <div className="space-y-3">
            {(metrics?.top_products ?? []).length === 0 && (
              <p className="text-sm text-[color:var(--muted-foreground)]">Belum ada penjualan.</p>
            )}
            {(metrics?.top_products ?? []).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[color:var(--secondary)] grid place-items-center overflow-hidden shrink-0">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Coffee className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate text-[color:var(--coffee)]">{p.name}</p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    {p.sold} terjual · {formatIDR(p.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-display text-lg text-[color:var(--coffee)]">Pesanan terbaru</h3>
          <Link to="/admin/pesanan" className="text-sm text-[color:var(--coffee)] hover:underline">
            Lihat semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
              <tr>
                <th className="py-2 pr-4">No. Pesanan</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recent10.map((o) => (
                <tr key={o.id} className="border-t border-[color:var(--border)]">
                  <td className="py-2 pr-4">
                    <Link
                      to="/admin/pesanan/$orderNumber"
                      params={{ orderNumber: o.order_number }}
                      className="text-[color:var(--coffee)] hover:underline font-mono text-xs"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{formatIDR(o.total)}</td>
                  <td className="py-2 pr-4"><OrderStatusBadge status={o.status} /></td>
                  <td className="py-2 text-[color:var(--muted-foreground)] text-xs">
                    {new Date(o.created_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {recent10.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-[color:var(--muted-foreground)]">Belum ada pesanan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</p>
        <Icon className="h-4 w-4 text-[color:var(--muted-foreground)]" />
      </div>
      <p className="mt-3 font-display text-2xl text-[color:var(--coffee)]">{value}</p>
    </div>
  );
}

function ActionCard({
  to,
  icon: Icon,
  count,
  label,
  tone = "neutral",
}: {
  to: string;
  icon: typeof TrendingUp;
  count: number;
  label: string;
  tone?: "warn" | "neutral";
}) {
  return (
    <Link
      to={to}
      className={`rounded-2xl border p-5 transition-colors ${
        tone === "warn"
          ? "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
          : "border-[color:var(--border)] bg-[color:var(--card)] hover:border-[color:var(--coffee)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${tone === "warn" ? "text-amber-700" : "text-[color:var(--muted-foreground)]"}`} />
        <span className="text-2xl font-display text-[color:var(--coffee)]">{count}</span>
      </div>
      <p className="mt-2 text-sm text-[color:var(--ink)]">{label}</p>
    </Link>
  );
}
