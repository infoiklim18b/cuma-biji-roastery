import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { BANKS, orderDetailQuery } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/use-user";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/akun/pesanan/$orderNumber/bayar")({
  head: ({ params }) => ({ meta: [{ title: `Bayar ${params.orderNumber} — Cuma Biji` }] }),
  loader: async ({ context, params }) => {
    const o = await context.queryClient.ensureQueryData(orderDetailQuery(params.orderNumber));
    if (!o) throw notFound();
  },
  component: PayPage,
});

function PayPage() {
  const { orderNumber } = Route.useParams();
  const { data: order } = useQuery(orderDetailQuery(orderNumber));
  const { userId } = useUserId();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [senderName, setSenderName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!order) return null;
  const bank = BANKS.find((b) => b.v === order.bank);
  const payment = (order.payments as Array<{ id: string; status: string }>)[0];

  async function submit() {
    if (!file) return toast.error("Pilih file bukti transfer dulu");
    if (!userId || !payment) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Ukuran maks 5MB");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      return toast.error("Format PNG/JPG/WEBP saja");
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${order!.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
      if (up.error) throw up.error;
      const { error: pErr } = await supabase
        .from("payments")
        .update({
          proof_url: path,
          sender_name: senderName.trim() || null,
          note: note.trim() || null,
          status: "menunggu",
        })
        .eq("id", payment.id);
      if (pErr) throw pErr;
      const { error: oErr } = await supabase
        .from("orders")
        .update({ status: "menunggu_verifikasi", paid_at: new Date().toISOString() })
        .eq("id", order!.id);
      if (oErr) throw oErr;
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "payment",
        title: "Bukti pembayaran terkirim",
        body: `Pesanan ${order!.order_number} sedang kami verifikasi.`,
        link: `/akun/pesanan/${order!.order_number}`,
      });
      qc.invalidateQueries({ queryKey: ["order", orderNumber] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Bukti terkirim, kami verifikasi maks 1×24 jam ☕");
      navigate({ to: "/akun/pesanan/$orderNumber", params: { orderNumber } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountLayout title="Upload bukti transfer">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-5 text-sm">
            <p className="eyebrow">Detail transfer</p>
            <p className="mt-3">
              <span className="text-[color:var(--muted-foreground)]">Bank: </span>
              <span className="font-medium">{bank?.l}</span>
            </p>
            <p>
              <span className="text-[color:var(--muted-foreground)]">No rek: </span>
              <span className="font-medium">{bank?.account}</span>
            </p>
            <p>
              <span className="text-[color:var(--muted-foreground)]">a/n: </span>
              <span className="font-medium">{bank?.holder}</span>
            </p>
            <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">Total tagihan</p>
            <p className="font-display text-3xl text-[color:var(--coffee)]">{formatIDR(order.total)}</p>
          </div>
          <Link
            to="/akun/pesanan/$orderNumber"
            params={{ orderNumber }}
            className="mt-4 inline-block text-xs text-[color:var(--coffee)] underline"
          >
            ← Kembali ke detail pesanan
          </Link>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Nama pengirim
            </span>
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Sesuai nama di rekening"
              className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] p-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Foto bukti (maks 5MB)
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--background)] p-3 text-sm"
            />
            {file && (
              <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
              Catatan (opsional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--background)] p-3 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !file}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--coffee)] px-5 py-3 text-sm font-medium text-[color:var(--primary-foreground)] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {busy ? "Mengunggah…" : "Kirim bukti transfer"}
          </button>
        </div>
      </div>
    </AccountLayout>
  );
}
