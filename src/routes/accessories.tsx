import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/accessories")({
  head: () => ({ meta: [{ title: "Aksesoris — Cuma Biji" }] }),
  component: () => (
    <ComingSoon eyebrow="Aksesoris" title="Alat seduh pilihan." description="V60, kettle, grinder — kurasi alat seduh terbaik." />
  ),
});
