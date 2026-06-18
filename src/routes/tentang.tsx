import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/tentang")({
  head: () => ({ meta: [{ title: "Tentang Kami — Cuma Biji" }] }),
  component: () => (
    <ComingSoon eyebrow="Tentang" title="Cerita Cuma Biji." description="Tentang siapa kami, dari mana kopi kami, dan kemana arahnya." />
  ),
});
