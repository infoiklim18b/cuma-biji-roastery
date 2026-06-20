import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { blogBySlugQuery, blogsQuery } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `${cap(params.slug)} — Jurnal Cuma Biji` },
      { property: "og:title", content: `${cap(params.slug)} — Jurnal Cuma Biji` },
    ],
  }),
  loader: async ({ context, params }) => {
    const b = await context.queryClient.ensureQueryData(blogBySlugQuery(params.slug));
    if (!b) throw notFound();
  },
  component: BlogDetail,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-editorial py-24 text-center">
        <h1 className="font-display text-3xl text-[color:var(--coffee)]">Artikel tidak ditemukan</h1>
        <Link to="/blog" className="mt-4 inline-block underline">
          ← Kembali ke jurnal
        </Link>
      </div>
    </PublicLayout>
  ),
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="container-editorial py-24 text-center text-sm">{error.message}</div>
    </PublicLayout>
  ),
});

function cap(s: string) {
  return s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function BlogDetail() {
  const { slug } = Route.useParams();
  const { data: post } = useQuery(blogBySlugQuery(slug));
  const { data: more } = useQuery(blogsQuery());

  if (!post) return null;
  const related = (more ?? []).filter((m) => m.slug !== slug).slice(0, 3);

  return (
    <PublicLayout>
      <article>
        <header className="border-b border-[color:var(--border)] bg-[color:var(--cream)]">
          <div className="container-editorial py-12 md:py-16">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)]"
            >
              <ChevronLeft className="h-4 w-4" /> Semua artikel
            </Link>
            {(post as { blog_categories?: { name?: string } }).blog_categories?.name && (
              <p className="eyebrow mt-6">
                {(post as { blog_categories?: { name?: string } }).blog_categories!.name}
              </p>
            )}
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-[color:var(--coffee)] md:text-5xl">
              {post.title}
            </h1>
            {post.published_at && (
              <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">
                {formatDate(post.published_at)}
              </p>
            )}
          </div>
        </header>

        {post.thumbnail && (
          <div className="container-editorial mt-8">
            <div className="aspect-[16/8] overflow-hidden rounded-2xl bg-[color:var(--cream)]">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="h-full w-full object-cover"
                width={1600}
                height={800}
              />
            </div>
          </div>
        )}

        <div className="container-editorial py-12 md:py-16">
          <div className="prose mx-auto max-w-2xl text-[color:var(--ink)]">
            {post.excerpt && (
              <p className="text-xl font-medium leading-relaxed text-[color:var(--coffee)]">
                {post.excerpt}
              </p>
            )}
            {post.content && (
              <div
                className="mt-8 space-y-5 text-[15px] leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-[color:var(--coffee)] [&_h2]:mt-10 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-[color:var(--coffee)] [&_h3]:mt-8 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: paragraphize(post.content) }}
              />
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-[color:var(--border)] bg-[color:var(--cream)]">
          <div className="container-editorial py-16">
            <p className="eyebrow">Lainnya di jurnal</p>
            <h2 className="mt-2 font-display text-3xl text-[color:var(--coffee)]">Bacaan terkait</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[color:var(--background)]">
                    {p.thumbnail && (
                      <img src={p.thumbnail} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg text-[color:var(--coffee)] group-hover:underline">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}

// Naive: split on double-newline into <p>; if HTML present, render as-is.
function paragraphize(content: string): string {
  if (/<\w+/.test(content)) return content;
  return content
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}
