import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Jurnal — Cuma Biji" }] }),
  component: () => (
    <ComingSoon eyebrow="Jurnal" title="Cerita dan panduan kopi." description="Panduan seduh, mengenal origin, roasting guide, dan coffee knowledge." />
  ),
});
