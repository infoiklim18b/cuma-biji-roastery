import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/_authenticated/akun/pesanan")({
  component: () => (
    <ComingSoon eyebrow="Pesanan" title="Riwayat pesananmu." description="Daftar pesanan dan tracking akan tersedia di Stage 2." />
  ),
});
