import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/komunitas")({
  component: () => (
    <ComingSoon eyebrow="Komunitas" title="Forum komunitas." description="Diskusi, resep, dan event. Aktif di Phase 2." />
  ),
});
