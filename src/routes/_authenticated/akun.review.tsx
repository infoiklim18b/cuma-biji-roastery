import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/_authenticated/akun/review")({
  component: () => (
    <ComingSoon eyebrow="Review" title="Review yang kamu tulis." description="Tersedia setelah ada pesanan selesai." />
  ),
});
