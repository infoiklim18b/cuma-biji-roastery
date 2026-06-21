import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Upload, CheckCircle2, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { OrderStatusTimeline } from "@/components/cuma/OrderStatusTimeline";
import { BANKS, COURIERS, ORDER_STATUS_LABEL, orderDetailQuery } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/use-user";
import { formatIDR, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/akun/pesanan/$orderNumber/")({
  head: ({ params }) => ({ meta: [{ title: `${params.orderNumber} — Cuma Biji` }] }),
  loader: async ({ context, params }) => {
    const o = await context.queryClient.ensureQueryData(orderDetailQuery(params.orderNumber));
    if (!o) throw notFound();
  },
  component: OrderDetailPage,
  notFoundComponent: () => (
    <AccountLayout title="Pesanan tidak ditemukan">
      <p className="text-sm text-[color:var(--muted-foreground)]">
        Periksa kembali nomor pesananmu.{" "}
        <Link to="/akun/pesanan" className="underline">
          Kembali ke daftar pesanan
        </Link>
      </p>
    </AccountLayout>
  ),
});



function OrderDetailPage() {
  const { orderNumber } = Route.useParams();
  const { data: order } = useQuery(orderDetailQuery(orderNumber));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  if (!order) return null;
  const bank = BANKS.find((b) => b.v === order.bank);
  const courier = COURIERS.find((c) => c.v === order.courier);
  const payment = (order.payments as Array<{ status: string; proof_url: string | null; amount: number }>)[0];
  const shipment = order.shipments as { tracking_number: string | null; shipped_at: string | null } | null;
  const items = order.order_items as Array<{
    id: string;
    name_snapshot: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    thumbnail: string | null;
    product_id: string | null;
  }>;

  async function cancel() {
    if (!confirm("Batalkan pesanan ini?")) return;
    setBusy(true);
    const { error } = await supabase.rpc("cancel_my_order", {
      p_order_id: order!.id,
      p_reason: "Dibatalkan oleh pembeli",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Pesanan dibatalkan");
    qc.invalidateQueries({ queryKey: ["order", orderNumber] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  async function markReceived() {
    setBusy(true);
    const { error } = await supabase.rpc("mark_order_received", { p_order_id: order!.id });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Terima kasih! Yuk tulis ulasan ☕");
    qc.invalidateQueries({ queryKey: ["order", orderNumber] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  return (
    <AccountLayout title={order.order_number}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-[color:var(--cream)] px-3 py-1 text-xs text-[color:var(--coffee)]">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
        <span className="text-xs text-[color:var(--muted-foreground)]">{formatDate(order.created_at)}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="mb-3 font-display text-lg text-[color:var(--coffee)]">Item pesanan</h2>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
              {items.map((it, i) => (
                <div
                  key={it.id}
                  className={`flex items-center gap-4 p-4 ${i > 0 ? "border-t border-[color:var(--border)]" : ""}`}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[color:var(--cream)]">
                    {it.thumbnail && (
                      <img src={it.thumbnail} alt={it.name_snapshot} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[color:var(--coffee)]">{it.name_snapshot}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {it.qty} × {formatIDR(it.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatIDR(it.subtotal)}</p>
                  {order.status === "selesai" && it.product_id && (
                    <button
                      type="button"
                      onClick={() => setReviewing(it.product_id!)}
                      className="rounded-full border border-[color:var(--coffee)] px-3 py-1 text-xs text-[color:var(--coffee)] hover:bg-[color:var(--coffee)] hover:text-[color:var(--cream)]"
                    >
                      <Star className="mr-1 inline h-3 w-3" /> Ulasan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg text-[color:var(--coffee)]">Status</h2>
            <OrderStatusTimeline status={order.status} />
          </section>

          {shipment && (
            <section>
              <h2 className="mb-3 font-display text-lg text-[color:var(--coffee)]">Pengiriman</h2>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 text-sm">
                <p>
                  <span className="text-[color:var(--muted-foreground)]">Kurir: </span>
                  {courier?.l}
                </p>
                <p className="mt-1">
                  <span className="text-[color:var(--muted-foreground)]">Resi: </span>
                  {shipment.tracking_number ?? "Belum tersedia"}
                </p>
                {shipment.shipped_at && (
                  <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                    Dikirim {formatDate(shipment.shipped_at)}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-5">
            <p className="eyebrow">Ringkasan</p>
            <dl className="mt-3 space-y-1 text-sm">
              <Row k="Subtotal" v={formatIDR(order.subtotal)} />
              {order.discount > 0 && <Row k="Diskon" v={`- ${formatIDR(order.discount)}`} />}
              <Row k="Ongkir" v={formatIDR(order.shipping_cost)} />
              <Row k="Total" v={formatIDR(order.total)} bold />
            </dl>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-sm">
            <p className="eyebrow mb-2">Pembayaran</p>
            <p>{bank?.l} — {bank?.account}</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">a/n {bank?.holder}</p>
            <p className="mt-2 text-xs">
              Status:{" "}
              <span className="font-medium text-[color:var(--coffee)]">
                {payment?.status === "diverifikasi" ? (
                  <CheckCircle2 className="inline h-3 w-3" />
                ) : payment?.status === "ditolak" ? (
                  <XCircle className="inline h-3 w-3 text-[color:var(--destructive)]" />
                ) : null}{" "}
                {payment?.status ?? "—"}
              </span>
            </p>
            {order.status === "menunggu_pembayaran" && (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/akun/pesanan/$orderNumber/bayar",
                    params: { orderNumber: order.order_number },
                  })
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--coffee)] px-4 py-2 text-sm text-[color:var(--cream)]"
              >
                <Upload className="h-4 w-4" /> Upload bukti transfer
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-sm">
            <p className="eyebrow mb-2">Alamat pengiriman</p>
            <p className="font-medium">{order.recipient_name}</p>
            <p className="text-[color:var(--muted-foreground)]">{order.recipient_phone}</p>
            <p className="text-[color:var(--muted-foreground)]">
              {order.recipient_street}, {order.recipient_city}, {order.recipient_province}{" "}
              {order.recipient_postal_code}
            </p>
          </div>

          {order.status === "menunggu_pembayaran" && (
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              className="w-full rounded-full border border-[color:var(--destructive)] py-2 text-sm text-[color:var(--destructive)] hover:bg-[color:var(--destructive)]/10"
            >
              Batalkan pesanan
            </button>
          )}
          {order.status === "dikirim" && (
            <button
              type="button"
              onClick={markReceived}
              disabled={busy}
              className="w-full rounded-full bg-[color:var(--coffee)] py-2 text-sm text-[color:var(--cream)]"
            >
              Pesanan diterima
            </button>
          )}
        </aside>
      </div>

      {reviewing && (
        <ReviewModal
          productId={reviewing}
          orderId={order.id}
          onClose={() => setReviewing(null)}
          onSaved={() => {
            setReviewing(null);
            qc.invalidateQueries({ queryKey: ["reviews", reviewing] });
            toast.success("Terima kasih atas ulasannya ☕");
          }}
        />
      )}
    </AccountLayout>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-[color:var(--border)] pt-2 text-base font-medium text-[color:var(--coffee)]" : ""}`}>
      <dt className={bold ? "" : "text-[color:var(--muted-foreground)]"}>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function ReviewModal({
  productId,
  orderId,
  onClose,
  onSaved,
}: {
  productId: string;
  orderId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { userId } = useUserId();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!userId) return;
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: userId,
      product_id: productId,
      order_id: orderId,
      rating,
      body: body.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-[color:var(--background)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-[color:var(--coffee)]">Tulis ulasan</h3>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star
                className={`h-7 w-7 ${
                  n <= rating ? "fill-[color:var(--coffee)] text-[color:var(--coffee)]" : "text-[color:var(--border)]"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="Bagaimana rasa kopinya?"
          className="mt-4 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-3 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-[color:var(--border)] px-4 py-2 text-sm">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-[color:var(--coffee)] px-4 py-2 text-sm text-[color:var(--cream)] disabled:opacity-50"
          >
            Kirim ulasan
          </button>
        </div>
      </div>
    </div>
  );
}
