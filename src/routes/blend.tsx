import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/blend")({
  head: () => ({ meta: [{ title: "Blend — Cuma Biji" }] }),
  component: () => (
    <ComingSoon eyebrow="Blend" title="Racikan harmoni Nusantara." description="House blend dan espresso blend kami." />
  ),
});
