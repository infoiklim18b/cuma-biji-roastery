import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/single-origin")({
  head: () => ({ meta: [{ title: "Single Origin — Cuma Biji" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Single Origin"
      title="Enam dataran tinggi, enam karakter."
      description="Jelajah Gayo, Toraja, Kintamani, Java Preanger, Flores Bajawa, dan Papua Wamena."
    />
  ),
});
