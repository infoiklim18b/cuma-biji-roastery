import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/cuma/ComingSoon";

export const Route = createFileRoute("/_authenticated/akun/wishlist")({
  component: () => (
    <ComingSoon eyebrow="Wishlist" title="Daftar keinginanmu." description="Aktif setelah katalog produk dirilis." />
  ),
});
