import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminOrdersQuery, type OrderStatus } from "@/lib/admin";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { formatIDR } from "@/lib/format";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/pesanan/")({
  head: () => ({ meta: [{ title: "Admin — Pesanan" }] }),
  component: AdminOrders,
});

const TABS: { v: OrderStatus | "all"; l: string }[] = [
  { v: "all", l: "Semua" },
  { v: "menunggu_pembayaran", l: "Menunggu bayar" },
  { v: "menunggu_verifikasi", l: "Verifikasi" },
  { v: "diproses", l: "Diproses" },
  { v: "dikirim", l: "Dikirim" },
  { v: "selesai", l: "Selesai" },
  { v: "dibatalkan", l: "Dibatalkan" },
  { v: "refund", l: "Refund" },
];

function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery(adminOrdersQuery({ status, search }));

  return (
    <AdminLayout title="Pesanan">
      <AdminMobileNav />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.v}
            onClick={() => setStatus(t.v)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              status === t.v
                ? "bg-[color:var(--coffee)] text-[color:var(--cream)]"
                : "bg-[color:var(--secondary)] text-[color:var(--ink)] hover:bg-[color:var(--secondary)]/70"
            }`}
          >
            {t.l}
          </button>
        ))}
        <div className="ml-auto relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted-foreground)]" />
          <Input
            placeholder="Cari no. pesanan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--secondary)]/40 text-left text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Penerima</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[color:var(--muted-foreground)]">Memuat…</td></tr>
              )}
              {!isLoading && (data ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[color:var(--muted-foreground)]">Tidak ada pesanan.</td></tr>
              )}
              {(data ?? []).map((o) => (
                <tr key={o.id} className="border-t border-[color:var(--border)] hover:bg-[color:var(--secondary)]/30">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/pesanan/$orderNumber"
                      params={{ orderNumber: o.order_number }}
                      className="font-mono text-xs text-[color:var(--coffee)] hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.recipient_name}</div>
                    <div className="text-xs text-[color:var(--muted-foreground)]">{o.recipient_city}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatIDR(o.total)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">
                    {new Date(o.created_at).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
