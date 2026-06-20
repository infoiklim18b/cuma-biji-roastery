import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, ShoppingBag, Share2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { ProductCard, roastLabel, processLabel } from "@/components/cuma/ProductCard";
import { Meter, RatingStars } from "@/components/cuma/RatingStars";
import { EmptyState } from "@/components/cuma/EmptyState";
import { productBySlugQuery, productsQuery, reviewsQuery } from "@/lib/queries";
import { formatIDR, formatDate } from "@/lib/format";
import productBag from "@/assets/product-bag.jpg";

export const Route = createFileRoute("/produk/$slug")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${formatTitle(params.slug)} — Cuma Biji` },
      { property: "og:title", content: `${formatTitle(params.slug)} — Cuma Biji` },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
    if (!data) throw notFound();
  },
  component: ProductDetailPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-editorial py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-3xl text-[color:var(--coffee)]">Produk tidak ditemukan</h1>
        <Link to="/shop" className="mt-6 inline-block text-sm underline">
          ← Kembali ke shop
        </Link>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="container-editorial py-24 text-center">
        <h1 className="font-display text-3xl text-[color:var(--coffee)]">Gagal memuat produk</h1>
        <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{error.message}</p>
      </div>
    </PublicLayout>
  ),
});

function formatTitle(slug: string) {
  return slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: product } = useQuery(productBySlugQuery(slug));
  const { data: reviews } = useQuery(reviewsQuery(product?.id ?? ""));
  const { data: related } = useQuery(
    productsQuery({
      kind: product?.kind,
      originSlug: product?.origins?.slug,
      sort: "best",
    }),
  );
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return null;

  const images =
    product.product_images && product.product_images.length > 0
      ? product.product_images.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url)
      : [product.thumbnail || productBag];

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
      : 0;

  const relatedProducts = (related ?? []).filter((p) => p.slug !== slug).slice(0, 4);

  function notYet() {
    toast.info("Fitur keranjang aktif di tahap berikutnya.");
  }

  return (
    <PublicLayout>
      <div className="container-editorial pt-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)]"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke shop
        </Link>
      </div>

      <section className="container-editorial grid gap-12 py-10 md:grid-cols-12 md:py-16">
        {/* GALLERY */}
        <div className="md:col-span-7">
          <div className="aspect-square overflow-hidden rounded-2xl bg-[color:var(--cream)]">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover"
              width={1024}
              height={1024}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-lg border ${
                    activeImg === i ? "border-[color:var(--coffee)]" : "border-[color:var(--border)]"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="md:col-span-5">
          {product.origins?.name && (
            <p className="eyebrow">
              {product.origins.name} · {product.origins.region}
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-[color:var(--coffee)] md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <RatingStars value={avgRating} />
            <span className="text-xs text-[color:var(--muted-foreground)]">
              {reviews?.length ?? 0} ulasan · {product.sold_count} terjual
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <p className="font-display text-3xl text-[color:var(--coffee)]">{formatIDR(product.price)}</p>
            {product.compare_price && product.compare_price > product.price && (
              <p className="text-sm text-[color:var(--muted-foreground)] line-through">
                {formatIDR(product.compare_price)}
              </p>
            )}
          </div>

          <p className="mt-5 text-[color:var(--muted-foreground)]">{product.description}</p>

          {/* META */}
          <dl className="mt-8 grid grid-cols-2 gap-y-4 border-y border-[color:var(--border)] py-6 text-sm">
            <MetaRow label="Berat" value={product.weight_g ? `${product.weight_g} gr` : "—"} />
            <MetaRow label="Stok" value={product.stock > 0 ? `${product.stock} tersedia` : "Habis"} />
            {product.roast_level && (
              <MetaRow label="Roast" value={roastLabel(product.roast_level)} />
            )}
            {product.process && <MetaRow label="Proses" value={processLabel(product.process)} />}
          </dl>

          {/* TASTING NOTES */}
          {product.tasting_notes && product.tasting_notes.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow mb-3">Tasting notes</p>
              <div className="flex flex-wrap gap-2">
                {product.tasting_notes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--cream)] px-3 py-1.5 text-xs text-[color:var(--coffee)]"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CUP PROFILE */}
          {(product.aroma || product.body || product.acidity) && (
            <div className="mt-6 grid gap-3">
              <Meter label="Aroma" value={product.aroma} />
              <Meter label="Body" value={product.body} />
              <Meter label="Acidity" value={product.acidity} />
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={notYet}
              disabled={product.stock === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-6 py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock === 0 ? "Stok habis" : "Tambah ke keranjang"}
            </button>
            <button
              type="button"
              onClick={notYet}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-5 py-3 text-sm hover:bg-[color:var(--secondary)]"
            >
              <Heart className="h-4 w-4" /> Wishlist
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link disalin");
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-5 py-3 text-sm hover:bg-[color:var(--secondary)]"
            >
              <Share2 className="h-4 w-4" /> Bagikan
            </button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="border-t border-[color:var(--border)] bg-[color:var(--cream)]">
        <div className="container-editorial py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Ulasan</p>
              <h2 className="mt-2 font-display text-3xl text-[color:var(--coffee)]">
                {reviews?.length ?? 0} ulasan dari pelanggan
              </h2>
            </div>
            <RatingStars value={avgRating} size={18} />
          </div>
          {reviews && reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[color:var(--coffee)]">
                      {(r as { profiles?: { full_name?: string } }).profiles?.full_name ?? "Pelanggan"}
                    </p>
                    <RatingStars value={r.rating ?? 0} />
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                    {formatDate(r.created_at)}
                  </p>
                  <p className="mt-4 text-sm">{r.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada ulasan"
              description="Jadilah yang pertama menulis ulasan setelah pesananmu sampai."
            />
          )}
        </div>
      </section>

      {/* RELATED */}
      {relatedProducts.length > 0 && (
        <section className="container-editorial py-16 md:py-24">
          <p className="eyebrow">Mungkin kamu suka</p>
          <h2 className="mt-2 font-display text-3xl text-[color:var(--coffee)]">Produk terkait</h2>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</dt>
      <dd className="mt-1 text-sm text-[color:var(--ink)]">{value}</dd>
    </div>
  );
}
