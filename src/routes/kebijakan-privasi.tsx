import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/kebijakan-privasi")({
  component: () => <ComingSoon eyebrow="Legal" title="Kebijakan privasi." description="Halaman ini sedang disiapkan." />,
});
