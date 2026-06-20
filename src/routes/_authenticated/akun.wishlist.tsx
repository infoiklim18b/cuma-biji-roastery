import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { EmptyState } from "@/components/cuma/EmptyState";
import { wishlistQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";
import productBag from "@/assets/product-bag.jpg";

export const Route = createFileRoute("/_authenticated/akun/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Cuma Biji" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const [userId, setUserId] = useState("");
  const qc = useQueryClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);
  const { data, isLoading } = useQuery({ ...wishlistQuery(userId), enabled: !!userId });

  async function handleRemove(id: string) {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus");
      return;
    }
    qc.invalidateQueries({ queryKey: ["wishlist", userId] });
  }

  const items = data ?? [];

  return (
    <AccountLayout title="Wishlist">
      {isLoading ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">Memuat…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="Wishlist masih kosong"
          description="Simpan kopi yang menarik perhatianmu untuk dibeli nanti."
          action={
            <Link to="/shop" className="text-sm font-medium text-[color:var(--coffee)] underline">
              Jelajah katalog →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {items.map((w) => (
            <article
              key={w.id}
              className="flex gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4"
            >
              <Link
                to="/produk/$slug"
                params={{ slug: w.products.slug }}
                className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[color:var(--cream)]"
              >
                <img
                  src={w.products.thumbnail || productBag}
                  alt={w.products.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to="/produk/$slug"
                  params={{ slug: w.products.slug }}
                  className="font-display text-lg text-[color:var(--coffee)] hover:underline"
                >
                  {w.products.name}
                </Link>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  {formatIDR(w.products.price)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(w.id)}
                title="Hapus"
                className="rounded-full p-2 text-[color:var(--destructive)] hover:bg-[color:var(--secondary)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
