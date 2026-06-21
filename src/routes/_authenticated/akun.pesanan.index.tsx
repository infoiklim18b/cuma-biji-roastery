import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { EmptyState } from "@/components/cuma/EmptyState";
import { ordersQuery, ORDER_STATUS_LABEL } from "@/lib/cart";
import type { OrderStatus } from "@/lib/cart";
import { useUserId } from "@/lib/use-user";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/akun/pesanan/")({
  head: () => ({ meta: [{ title: "Pesanan saya — Cuma Biji" }] }),
  component: OrdersPage,
});

const STATUSES: { v: OrderStatus | "all"; l: string }[] = [
  { v: "all", l: "Semua" },
  { v: "menunggu_pembayaran", l: "Menunggu bayar" },
  { v: "menunggu_verifikasi", l: "Verifikasi" },
  { v: "diproses", l: "Diproses" },
  { v: "dikirim", l: "Dikirim" },
  { v: "selesai", l: "Selesai" },
  { v: "dibatalkan", l: "Batal" },
];

function OrdersPage() {
  const { userId } = useUserId();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    ...ordersQuery(userId, status === "all" ? undefined : status, search || undefined),
    enabled: !!userId,
  });

  const list = data ?? [];

  return (
    <AccountLayout title="Pesanan saya">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.v}
              type="button"
              onClick={() => setStatus(s.v)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                status === s.v
                  ? "border-[color:var(--coffee)] bg-[color:var(--coffee)] text-[color:var(--cream)]"
                  : "border-[color:var(--border)] text-[color:var(--ink)] hover:bg-[color:var(--secondary)]"
              }`}
            >
              {s.l}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. pesanan"
            className="w-56 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">Memuat…</p>
      ) : list.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesananmu akan muncul di sini setelah kamu checkout."
          action={
            <Link to="/shop" className="text-sm font-medium text-[color:var(--coffee)] underline">
              Belanja sekarang →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {list.map((o) => (
            <Link
              key={o.id}
              to="/akun/pesanan/$orderNumber"
              params={{ orderNumber: o.order_number }}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 hover:border-[color:var(--coffee)]"
            >
              <div>
                <p className="font-display text-lg text-[color:var(--coffee)]">{o.order_number}</p>
                <p className="text-xs text-[color:var(--muted-foreground)]">{formatDate(o.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[color:var(--coffee)]">{formatIDR(o.total)}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]">
                  {ORDER_STATUS_LABEL[o.status]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
