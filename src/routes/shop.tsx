import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { z } from "zod";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { ProductCard } from "@/components/cuma/ProductCard";
import { EmptyState } from "@/components/cuma/EmptyState";
import { productsQuery, originsQuery } from "@/lib/queries";

const searchSchema = z.object({
  q: z.string().optional(),
  origin: z.string().optional(),
  roast: z.string().optional(),
  process: z.string().optional(),
  sort: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Specialty Coffee — Cuma Biji" },
      { name: "description", content: "Katalog kopi specialty Indonesia: single origin, blend, dan aksesoris." },
      { property: "og:title", content: "Shop — Cuma Biji" },
      { property: "og:description", content: "Single origin, blend, dan aksesoris terbaik Nusantara." },
    ],
  }),
  component: ShopPage,
});

const ROAST = [
  { v: "light", l: "Light" },
  { v: "medium", l: "Medium" },
  { v: "medium_dark", l: "Medium Dark" },
  { v: "dark", l: "Dark" },
];
const PROCESS = [
  { v: "washed", l: "Washed" },
  { v: "natural", l: "Natural" },
  { v: "honey", l: "Honey" },
  { v: "wet_hulled", l: "Wet Hulled" },
];
const SORTS = [
  { v: "new", l: "Terbaru" },
  { v: "best", l: "Terlaris" },
  { v: "price_asc", l: "Harga terendah" },
  { v: "price_desc", l: "Harga tertinggi" },
];

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");

  const { data: origins } = useQuery(originsQuery());
  const { data, isLoading } = useQuery(
    productsQuery({
      originSlug: search.origin,
      roastLevel: search.roast,
      process: search.process,
      sort: search.sort ?? "new",
      search: search.q,
    }),
  );

  const total = data?.length ?? 0;

  function setParam(key: string, value?: string) {
    navigate({
      search: (prev: z.infer<typeof searchSchema>) => ({ ...prev, [key]: value || undefined }),
      replace: true,
    });
  }

  const grid = useMemo(() => data ?? [], [data]);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Shop"
        title="Katalog specialty kopi Nusantara."
        description="Single origin, blend, dan aksesoris pilihan. Disangrai segar setiap minggu."
      />

      <section className="container-editorial py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <aside className="md:col-span-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setParam("q", q);
              }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kopi…"
                className="w-full rounded-full border border-[color:var(--border)] bg-[color:var(--background)] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[color:var(--sage-deep)]"
              />
            </form>

            <FilterGroup label="Origin">
              <FilterChip active={!search.origin} onClick={() => setParam("origin")}>
                Semua
              </FilterChip>
              {origins?.map((o) => (
                <FilterChip
                  key={o.slug}
                  active={search.origin === o.slug}
                  onClick={() => setParam("origin", o.slug)}
                >
                  {o.name}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Roast Level">
              <FilterChip active={!search.roast} onClick={() => setParam("roast")}>
                Semua
              </FilterChip>
              {ROAST.map((r) => (
                <FilterChip
                  key={r.v}
                  active={search.roast === r.v}
                  onClick={() => setParam("roast", r.v)}
                >
                  {r.l}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Proses">
              <FilterChip active={!search.process} onClick={() => setParam("process")}>
                Semua
              </FilterChip>
              {PROCESS.map((p) => (
                <FilterChip
                  key={p.v}
                  active={search.process === p.v}
                  onClick={() => setParam("process", p.v)}
                >
                  {p.l}
                </FilterChip>
              ))}
            </FilterGroup>
          </aside>

          <div className="md:col-span-9">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {isLoading ? "Memuat…" : `${total} produk ditemukan`}
              </p>
              <select
                value={search.sort ?? "new"}
                onChange={(e) => setParam("sort", e.target.value)}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2 text-sm outline-none focus:border-[color:var(--sage-deep)]"
              >
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    Urutkan: {s.l}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <SkeletonGrid />
            ) : grid.length === 0 ? (
              <EmptyState
                title="Tidak ada produk yang cocok"
                description="Coba ubah filter atau kata kuncimu."
              />
            ) : (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="eyebrow mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-[color:var(--coffee)] bg-[color:var(--coffee)] text-[color:var(--cream)]"
          : "border-[color:var(--border)] bg-[color:var(--background)] hover:border-[color:var(--coffee)]"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square animate-pulse rounded-xl bg-[color:var(--cream)]" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[color:var(--cream)]" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[color:var(--cream)]" />
        </div>
      ))}
    </div>
  );
}
