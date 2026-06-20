import { Link } from "@tanstack/react-router";
import type { ProductRow } from "@/lib/queries";
import { formatIDR } from "@/lib/format";
import productBag from "@/assets/product-bag.jpg";

export function ProductCard({ product }: { product: ProductRow }) {
  const img = product.thumbnail || productBag;
  const onSale = product.compare_price && product.compare_price > product.price;
  return (
    <Link
      to="/produk/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[color:var(--cream)]">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[color:var(--ink)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[color:var(--cream)]">
            Habis
          </span>
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-[color:var(--coffee)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[color:var(--cream)]">
            Promo
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.origins?.name && (
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--muted-foreground)]">
              {product.origins.name}
            </p>
          )}
          <h3 className="mt-1 truncate font-display text-lg text-[color:var(--coffee)] group-hover:underline">
            {product.name}
          </h3>
          {product.roast_level && (
            <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)] capitalize">
              {roastLabel(product.roast_level)}
              {product.weight_g ? ` · ${product.weight_g}gr` : ""}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-base text-[color:var(--coffee)]">{formatIDR(product.price)}</p>
          {onSale && (
            <p className="text-xs text-[color:var(--muted-foreground)] line-through">
              {formatIDR(product.compare_price!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function roastLabel(r: string) {
  switch (r) {
    case "light":
      return "Light Roast";
    case "medium":
      return "Medium Roast";
    case "medium_dark":
      return "Medium Dark";
    case "dark":
      return "Dark Roast";
    default:
      return r;
  }
}

export function processLabel(p: string) {
  switch (p) {
    case "washed":
      return "Washed";
    case "natural":
      return "Natural";
    case "honey":
      return "Honey";
    case "wet_hulled":
      return "Wet Hulled";
    case "anaerobic":
      return "Anaerobic";
    default:
      return p;
  }
}
