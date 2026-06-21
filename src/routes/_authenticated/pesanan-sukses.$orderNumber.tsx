import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Upload } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { orderDetailQuery } from "@/lib/cart";
import { BANKS } from "@/lib/cart";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/pesanan-sukses/$orderNumber")({
  head: () => ({ meta: [{ title: "Pesanan dibuat — Cuma Biji" }] }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(orderDetailQuery(params.orderNumber));
    if (!data) throw notFound();
  },
  component: SuccessPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-editorial py-24 text-center">Pesanan tidak ditemukan.</div>
    </PublicLayout>
  ),
});

function SuccessPage() {
  const { orderNumber } = Route.useParams();
  const { data: order } = useQuery(orderDetailQuery(orderNumber));
  if (!order) return null;
  const bank = BANKS.find((b) => b.v === order.bank);

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} disalin`);
  }

  return (
    <PublicLayout>
      <section className="container-editorial py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pesanan dibuat</p>
          <h1 className="mt-3 font-display text-4xl text-[color:var(--coffee)] md:text-5xl">
            Terima kasih, pesananmu sudah masuk ☕
          </h1>
          <p className="mt-4 text-[color:var(--muted-foreground)]">
            Nomor pesanan{" "}
            <button
              onClick={() => copy(order.order_number, "Nomor")}
              className="font-medium text-[color:var(--coffee)] underline"
            >
              {order.order_number}
            </button>
            . Selesaikan pembayaran dalam 24 jam untuk menjaga pesanan tetap aktif.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-6 md:p-8">
          <p className="eyebrow">Instruksi transfer</p>
          <div className="mt-4 grid gap-3">
            <CopyRow label="Bank" value={`Transfer ${bank?.l}`} onCopy={() => {}} />
            <CopyRow label="Nomor rekening" value={bank?.account ?? ""} onCopy={() => copy(bank?.account ?? "", "Nomor rekening")} />
            <CopyRow label="Atas nama" value={bank?.holder ?? ""} onCopy={() => {}} />
            <div className="rounded-xl border border-[color:var(--coffee)] bg-[color:var(--background)] p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Total transfer (mohon transfer sesuai nominal)
              </p>
              <p className="mt-1 font-display text-3xl text-[color:var(--coffee)]">{formatIDR(order.total)}</p>
              <button
                onClick={() => copy(String(order.total), "Total")}
                className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--coffee)] underline"
              >
                <Copy className="h-3 w-3" /> Salin nominal
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">
            Nominal sudah ditambah 3 digit unik untuk verifikasi otomatis. Setelah transfer, upload bukti agar tim kami segera memprosesnya.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/akun/pesanan/$orderNumber/bayar"
              params={{ orderNumber: order.order_number }}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-5 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)]"
            >
              <Upload className="h-4 w-4" /> Upload bukti transfer
            </Link>
            <Link
              to="/akun/pesanan/$orderNumber"
              params={{ orderNumber: order.order_number }}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm"
            >
              Lihat detail pesanan
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[color:var(--background)] px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</p>
        <p className="mt-0.5 font-medium text-[color:var(--coffee)]">{value}</p>
      </div>
      <button onClick={onCopy} className="rounded-full p-2 hover:bg-[color:var(--secondary)]" aria-label="Salin">
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
