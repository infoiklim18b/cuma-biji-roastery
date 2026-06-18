import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/blog/$slug")({
  component: () => (
    <ComingSoon eyebrow="Artikel" title="Artikel sedang ditulis." description="Halaman artikel detail akan tersedia di tahap berikutnya." />
  ),
});
