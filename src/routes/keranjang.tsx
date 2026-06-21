import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, ShoppingBag, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { EmptyState } from "@/components/cuma/EmptyState";
import { QuantityStepper } from "@/components/cuma/QuantityStepper";
import { cartQuery, cartSubtotal, removeCartItem, updateCartItemQty } from "@/lib/cart";
import { useUserId } from "@/lib/use-user";
import { formatIDR } from "@/lib/format";
import productBag from "@/assets/product-bag.jpg";

export const Route = createFileRoute("/keranjang")({
  ssr: false,
  head: () => ({ meta: [{ title: "Keranjang — Cuma Biji" }] }),
  component: CartPage,
});

function CartPage() {
  const { userId, loading } = useUserId();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ ...cartQuery(userId), enabled: !!userId });

  if (loading) {
    return (
      <PublicLayout>
        <div className="container-editorial py-24 text-center text-sm text-[color:var(--muted-foreground)]">
          Memuat keranjang…
        </div>
      </PublicLayout>
    );
  }

  if (!userId) {
    return (
      <PublicLayout>
        <PageHero eyebrow="Keranjang" title="Masuk untuk melihat keranjangmu." />
        <div className="container-editorial pb-24 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-6 py-3 text-sm font-medium text-[color:var(--primary-foreground)]"
          >
            Masuk / daftar
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const items = data?.items ?? [];
  const subtotal = cartSubtotal(items);

  async function changeQty(id: string, qty: number, max: number) {
    if (qty > max) {
      toast.error("Melebihi stok tersedia");
      return;
    }
    try {
      await updateCartItemQty(id, qty);
      qc.invalidateQueries({ queryKey: ["cart", userId] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    await removeCartItem(id);
    qc.invalidateQueries({ queryKey: ["cart", userId] });
    toast.success("Item dihapus");
  }

  return (
    <PublicLayout>
      <PageHero eyebrow="Keranjang" title={items.length > 0 ? `${items.length} item siap diseduh` : "Keranjangmu"} />
      <section className="container-editorial pb-24">
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[color:var(--cream)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Keranjangmu masih kosong"
            description="Yuk jelajah Nusantara — pilih single origin, blend, atau racik sendiri."
            action={
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-5 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)]"
              >
                <ShoppingBag className="h-4 w-4" /> Mulai belanja
              </Link>
            }
          />
        ) : (
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="grid gap-4">
                {items.map((it) => {
                  const img = it.products?.thumbnail || productBag;
                  const stock = it.products?.stock ?? 99;
                  return (
                    <article
                      key={it.id}
                      className="flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 sm:flex-row"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[color:var(--cream)]">
                        {it.products?.slug ? (
                          <Link to="/produk/$slug" params={{ slug: it.products.slug }}>
                            <img src={img} alt={it.name_snapshot} className="h-full w-full object-cover" />
                          </Link>
                        ) : (
                          <div className="grid h-full w-full place-items-center text-2xl">☕</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-display text-lg text-[color:var(--coffee)]">{it.name_snapshot}</p>
                            <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                              {it.weight_g ? `${it.weight_g}gr` : ""}
                              {it.grind ? ` · ${it.grind.replace("_", " ")}` : ""}
                              {it.custom_config ? " · Racikan kustom" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(it.id)}
                            className="rounded-full p-2 text-[color:var(--destructive)] hover:bg-[color:var(--secondary)]"
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <QuantityStepper
                            value={it.qty}
                            max={it.product_id ? stock : 10}
                            onChange={(q) => changeQty(it.id, q, it.product_id ? stock : 10)}
                          />
                          <p className="font-display text-lg text-[color:var(--coffee)]">
                            {formatIDR(it.unit_price * it.qty)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <aside className="md:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-6">
                <p className="eyebrow">Ringkasan</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--muted-foreground)]">Subtotal</dt>
                    <dd className="font-medium text-[color:var(--coffee)]">{formatIDR(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[color:var(--muted-foreground)]">Ongkir</dt>
                    <dd className="text-[color:var(--muted-foreground)]">Dihitung di checkout</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/checkout" })}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--coffee)] px-5 py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90"
                >
                  Lanjut ke checkout <ChevronRight className="h-4 w-4" />
                </button>
                <Link
                  to="/shop"
                  className="mt-3 block text-center text-xs text-[color:var(--coffee)] underline"
                >
                  Belanja lebih banyak
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
