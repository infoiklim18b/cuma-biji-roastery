import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/keranjang")({
  head: () => ({ meta: [{ title: "Keranjang — Cuma Biji" }] }),
  component: () => (
    <ComingSoon eyebrow="Keranjang" title="Keranjang masih kosong." description="Fitur keranjang & checkout aktif di tahap berikutnya." />
  ),
});
