import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

const ORDER_STYLES: Record<OrderStatus, string> = {
  menunggu_pembayaran: "bg-amber-50 text-amber-700 ring-amber-200",
  menunggu_verifikasi: "bg-blue-50 text-blue-700 ring-blue-200",
  diproses: "bg-violet-50 text-violet-700 ring-violet-200",
  dikirim: "bg-sky-50 text-sky-700 ring-sky-200",
  selesai: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  dibatalkan: "bg-rose-50 text-rose-700 ring-rose-200",
  refund: "bg-stone-100 text-stone-700 ring-stone-200",
};

const PAY_STYLES: Record<PaymentStatus, string> = {
  menunggu: "bg-amber-50 text-amber-700 ring-amber-200",
  diverifikasi: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ditolak: "bg-rose-50 text-rose-700 ring-rose-200",
  refund: "bg-stone-100 text-stone-700 ring-stone-200",
};

const LABELS: Record<string, string> = {
  menunggu_pembayaran: "Menunggu bayar",
  menunggu_verifikasi: "Verifikasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  refund: "Refund",
  menunggu: "Menunggu",
  diverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${ORDER_STYLES[status]}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${PAY_STYLES[status]}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
