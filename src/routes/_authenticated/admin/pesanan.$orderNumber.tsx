import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Package, Truck, RefreshCcw, XCircle, CheckCircle2 } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import {
  adminOrderDetailQuery,
  setShipment,
  setOrderStatus,
  refundOrder,
  adjustShipping,
  verifyPayment,
  type Courier,
} from "@/lib/admin";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { formatIDR } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pesanan/$orderNumber")({
  head: ({ params }) => ({ meta: [{ title: `Admin — ${params.orderNumber}` }] }),
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { orderNumber } = Route.useParams();
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery(adminOrderDetailQuery(orderNumber));
  const [courier, setCourier] = useState<Courier>("jne");
  const [tracking, setTracking] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "order", orderNumber] });
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    qc.invalidateQueries({ queryKey: ["admin", "payments-queue"] });
    qc.invalidateQueries({ queryKey: ["admin", "metrics"] });
  };

  async function doAction(action: () => Promise<unknown>, ok: string) {
    try {
      await action();
      toast.success(ok);
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (isLoading) {
    return <AdminLayout title="Memuat…"><div /></AdminLayout>;
  }
  if (!order) {
    return (
      <AdminLayout title="Tidak ditemukan">
        <p>Pesanan tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  const payment = order.payments?.[0];
  const shipment = order.shipments?.[0];
  const proofUrl = payment?.proof_url;

  async function viewProof() {
    if (!proofUrl) return;
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(proofUrl, 300);
    if (error) {
      toast.error("Gagal memuat bukti");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  return (
    <AdminLayout title={`Pesanan ${order.order_number}`}>
      <AdminMobileNav />
      <Link
        to="/admin/pesanan"
        className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)] mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[color:var(--muted-foreground)]">{order.order_number}</p>
                <p className="text-xs mt-1">{new Date(order.created_at).toLocaleString("id-ID")}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            {order.cancel_reason && (
              <p className="mt-3 text-sm text-rose-700 bg-rose-50 rounded-md p-3">
                Catatan pembatalan/refund: {order.cancel_reason}
              </p>
            )}
          </Card>

          <Card title="Item">
            <div className="divide-y divide-[color:var(--border)]">
              {(order.order_items ?? []).map((it) => (
                <div key={it.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 rounded-md bg-[color:var(--secondary)] overflow-hidden shrink-0">
                    {it.thumbnail && <img src={it.thumbnail} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[color:var(--coffee)] truncate">{it.name_snapshot}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {it.qty} × {formatIDR(it.unit_price)}
                      {it.weight_g ? ` · ${it.weight_g}g` : ""}
                      {it.grind ? ` · ${it.grind}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatIDR(it.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[color:var(--border)] space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatIDR(order.subtotal)} />
              <Row label="Diskon" value={`- ${formatIDR(order.discount)}`} />
              <Row label="Ongkir" value={formatIDR(order.shipping_cost)} />
              <Row label="Total" value={formatIDR(order.total)} bold />
              {order.voucher_code && (
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  Voucher: {order.voucher_code}
                </p>
              )}
            </div>
          </Card>

          <Card title="Penerima & pengiriman">
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.recipient_name}</p>
              <p>{order.recipient_phone}</p>
              <p className="text-[color:var(--muted-foreground)]">
                {order.recipient_street}, {order.recipient_city}, {order.recipient_province}{" "}
                {order.recipient_postal_code}
              </p>
              {shipment?.tracking_number && (
                <p className="mt-2 text-sm">
                  Kurir: <strong>{shipment.courier}</strong> · Resi:{" "}
                  <span className="font-mono">{shipment.tracking_number}</span>
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pembayaran">
            {payment ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <Row label="Bank" value={payment.bank.toUpperCase()} />
                <Row label="Nominal" value={formatIDR(payment.amount)} />
                {payment.admin_note && (
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    Catatan: {payment.admin_note}
                  </p>
                )}
                {proofUrl ? (
                  <button
                    onClick={viewProof}
                    className="text-xs text-[color:var(--coffee)] hover:underline"
                  >
                    Lihat bukti transfer →
                  </button>
                ) : (
                  <p className="text-xs text-[color:var(--muted-foreground)]">Belum upload bukti.</p>
                )}
                {payment.status === "menunggu" && proofUrl && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => doAction(() => verifyPayment(payment.id, true), "Pembayaran diverifikasi")}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const note = prompt("Alasan tolak?") ?? undefined;
                        doAction(() => verifyPayment(payment.id, false, note), "Pembayaran ditolak");
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Tolak
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">Belum ada data pembayaran.</p>
            )}
          </Card>

          {(order.status === "diproses" || order.status === "dikirim") && (
            <Card title="Input/ubah resi">
              <div className="space-y-2">
                <Select value={courier} onValueChange={(v) => setCourier(v as Courier)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jne">JNE</SelectItem>
                    <SelectItem value="jnt">J&T</SelectItem>
                    <SelectItem value="sicepat">SiCepat</SelectItem>
                    <SelectItem value="anteraja">AnterAja</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Nomor resi"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={!tracking}
                  onClick={() => doAction(() => setShipment(order.id, courier, tracking), "Resi tersimpan, pesanan dikirim")}
                >
                  <Truck className="h-4 w-4 mr-1" /> Tandai dikirim
                </Button>
              </div>
            </Card>
          )}

          {order.status === "menunggu_pembayaran" && (
            <Card title="Adjust ongkir">
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder={`Saat ini: ${order.shipping_cost}`}
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={!shippingCost}
                  onClick={() => doAction(() => adjustShipping(order.id, Number(shippingCost)), "Ongkir diperbarui")}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" /> Update total
                </Button>
              </div>
            </Card>
          )}

          <Card title="Aksi lain">
            <div className="space-y-2">
              {order.status === "diproses" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => doAction(() => setOrderStatus(order.id, "diproses"), "Status diperbarui")}
                >
                  <Package className="h-4 w-4 mr-1" /> Sedang diproses
                </Button>
              )}
              {order.status !== "selesai" && order.status !== "dibatalkan" && order.status !== "refund" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setRefundReason(prompt("Alasan refund?") ?? "");
                    if (refundReason || true) {
                      const r = prompt("Alasan refund?") ?? undefined;
                      doAction(() => refundOrder(order.id, r), "Pesanan direfund");
                    }
                  }}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" /> Refund
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
      {title && <h3 className="font-display text-base text-[color:var(--coffee)] mb-3">{title}</h3>}
      {children}
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-medium text-[color:var(--coffee)]" : ""}`}>
      <span className="text-[color:var(--muted-foreground)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
