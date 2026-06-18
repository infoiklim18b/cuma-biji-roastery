import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/_authenticated/akun/alamat")({
  component: () => (
    <ComingSoon eyebrow="Alamat" title="Buku alamat." description="Kelola alamat pengiriman di tahap berikutnya." />
  ),
});
