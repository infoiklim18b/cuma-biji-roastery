import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — Cuma Biji" }] }),
  component: () => (
    <ComingSoon
      eyebrow="Shop"
      title="Katalog lengkap sedang disangrai."
      description="Halaman shop dengan grid produk, filter origin & roast level, dan sort akan tersedia di tahap berikutnya."
    />
  ),
});
