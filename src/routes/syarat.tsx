import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/syarat")({
  component: () => <ComingSoon eyebrow="Legal" title="Syarat & ketentuan." description="Halaman ini sedang disiapkan." />,
});
