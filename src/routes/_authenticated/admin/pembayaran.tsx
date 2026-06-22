import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, XCircle, FileImage } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminPaymentsQueueQuery, verifyPayment } from "@/lib/admin";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pembayaran")({
  head: () => ({ meta: [{ title: "Admin — Pembayaran" }] }),
  component: AdminPayments,
});

function AdminPayments() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminPaymentsQueueQuery());

  async function viewProof(path: string) {
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(path, 300);
    if (error) return toast.error("Gagal memuat bukti");
    window.open(data.signedUrl, "_blank");
  }

  async function decide(id: string, approve: boolean) {
    const note = approve ? undefined : prompt("Alasan tolak?") ?? undefined;
    try {
      await verifyPayment(id, approve, note);
      toast.success(approve ? "Pembayaran diverifikasi ☕" : "Pembayaran ditolak");
      qc.invalidateQueries({ queryKey: ["admin", "payments-queue"] });
      qc.invalidateQueries({ queryKey: ["admin", "metrics"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AdminLayout title="Verifikasi pembayaran">
      <AdminMobileNav />
      <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
        Antrian bukti transfer yang menunggu verifikasi.
      </p>
      <div className="space-y-3">
        {isLoading && <p className="text-sm">Memuat…</p>}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-10 text-center text-[color:var(--muted-foreground)]">
            Tidak ada pembayaran menunggu verifikasi 🎉
          </div>
        )}
        {(data ?? []).map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 grid gap-4 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <Link
                to="/admin/pesanan/$orderNumber"
                params={{ orderNumber: p.orders?.order_number ?? "" }}
                className="font-mono text-xs text-[color:var(--coffee)] hover:underline"
              >
                {p.orders?.order_number}
              </Link>
              <p className="mt-1 font-display text-lg text-[color:var(--coffee)]">
                {formatIDR(p.amount)}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {p.bank.toUpperCase()} · {new Date(p.created_at).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {p.proof_url && (
                <Button size="sm" variant="outline" onClick={() => viewProof(p.proof_url!)}>
                  <FileImage className="h-4 w-4 mr-1" /> Lihat bukti
                </Button>
              )}
              <Button size="sm" onClick={() => decide(p.id, true)}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => decide(p.id, false)}>
                <XCircle className="h-4 w-4 mr-1" /> Tolak
              </Button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
