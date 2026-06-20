import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { EmptyState } from "@/components/cuma/EmptyState";
import { blogCategoriesQuery, blogsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";

const searchSchema = z.object({ cat: z.string().optional(), q: z.string().optional() });

export const Route = createFileRoute("/blog")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Jurnal Kopi — Cuma Biji" },
      { name: "description", content: "Panduan seduh, mengenal origin, roasting guide, dan coffee knowledge." },
      { property: "og:title", content: "Jurnal Kopi — Cuma Biji" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const { data: cats } = useQuery(blogCategoriesQuery());
  const { data: posts, isLoading } = useQuery(blogsQuery(search.cat, search.q));

  function setParam(key: string, v?: string) {
    navigate({ search: (prev) => ({ ...prev, [key]: v || undefined }), replace: true });
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Jurnal"
        title="Cerita & panduan kopi."
        description="Catatan dari roastery, tips menyeduh, dan kisah dari para petani."
      />

      <section className="container-editorial py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-6">
          <div className="flex flex-wrap gap-2">
            <CatChip active={!search.cat} onClick={() => setParam("cat")}>
              Semua
            </CatChip>
            {cats?.map((c) => (
              <CatChip
                key={c.slug}
                active={search.cat === c.slug}
                onClick={() => setParam("cat", c.slug)}
              >
                {c.name}
              </CatChip>
            ))}
          </div>
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
              placeholder="Cari artikel…"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] py-2 pl-9 pr-4 text-sm outline-none focus:border-[color:var(--sage-deep)]"
            />
          </form>
        </div>

        {isLoading ? (
          <p className="py-12 text-sm text-[color:var(--muted-foreground)]">Memuat…</p>
        ) : posts && posts.length > 0 ? (
          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[color:var(--cream)]">
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="mt-4">
                  {(p as { blog_categories?: { name?: string } }).blog_categories?.name && (
                    <p className="eyebrow">
                      {(p as { blog_categories?: { name?: string } }).blog_categories!.name}
                    </p>
                  )}
                  <h3 className="mt-2 font-display text-xl text-[color:var(--coffee)] group-hover:underline">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-[color:var(--muted-foreground)]">
                      {p.excerpt}
                    </p>
                  )}
                  {p.published_at && (
                    <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
                      {formatDate(p.published_at)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState title="Belum ada artikel" description="Coba ubah kategori atau kata kuncimu." />
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

function CatChip({
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
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-[color:var(--coffee)] bg-[color:var(--coffee)] text-[color:var(--cream)]"
          : "border-[color:var(--border)] hover:border-[color:var(--coffee)]"
      }`}
    >
      {children}
    </button>
  );
}
