import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { EmptyState } from "@/components/cuma/EmptyState";

export const Route = createFileRoute("/_authenticated/akun/pesanan")({
  head: () => ({ meta: [{ title: "Pesanan saya — Cuma Biji" }] }),
  component: () => (
    <AccountLayout title="Pesanan saya">
      <EmptyState
        title="Belum ada pesanan"
        description="Pesananmu akan muncul di sini setelah kamu checkout. Yuk mulai jelajah katalog."
        action={
          <Link to="/shop" className="text-sm font-medium text-[color:var(--coffee)] underline">
            Belanja sekarang →
          </Link>
        }
      />
    </AccountLayout>
  ),
});
