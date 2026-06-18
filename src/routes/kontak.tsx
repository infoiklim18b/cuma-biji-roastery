import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/kontak")({
  head: () => ({ meta: [{ title: "Kontak — Cuma Biji" }] }),
  component: () => (
    <ComingSoon eyebrow="Kontak" title="Sapa kami." description="Form kontak akan tersedia di tahap berikutnya." />
  ),
});
