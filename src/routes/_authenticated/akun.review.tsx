import { createFileRoute } from "@tanstack/react-router";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { EmptyState } from "@/components/cuma/EmptyState";

export const Route = createFileRoute("/_authenticated/akun/review")({
  head: () => ({ meta: [{ title: "Review saya — Cuma Biji" }] }),
  component: () => (
    <AccountLayout title="Review saya">
      <EmptyState
        title="Belum ada ulasan"
        description="Kamu bisa menulis ulasan setelah pesanan diterima. Setiap ulasan membantu pelanggan lain memilih."
      />
    </AccountLayout>
  ),
});
