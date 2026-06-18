import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/custom")({
  head: () => ({ meta: [{ title: "Custom Coffee Builder — Cuma Biji" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Custom Coffee Builder"
      title="Racik kopimu — origin, sangrai, gilingan."
      description="Builder 4 langkah: origin · roast · berat · grind. Akan tersedia setelah tahap berikutnya."
    />
  ),
});
