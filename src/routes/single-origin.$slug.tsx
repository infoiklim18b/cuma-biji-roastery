import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { ProductCard } from "@/components/cuma/ProductCard";
import { EmptyState } from "@/components/cuma/EmptyState";
import { originBySlugQuery, productsQuery } from "@/lib/queries";
import gayoImg from "@/assets/origins/gayo.jpg";
import torajaImg from "@/assets/origins/toraja.jpg";
import kintamaniImg from "@/assets/origins/kintamani.jpg";
import javaImg from "@/assets/origins/java-preanger.jpg";
import floresImg from "@/assets/origins/flores-bajawa.jpg";
import papuaImg from "@/assets/origins/papua.jpg";

const IMG: Record<string, string> = {
  gayo: gayoImg,
  toraja: torajaImg,
  kintamani: kintamaniImg,
  "java-preanger": javaImg,
  "flores-bajawa": floresImg,
  papua: papuaImg,
};

export const Route = createFileRoute("/single-origin/$slug")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `Kopi ${cap(params.slug)} — Cuma Biji` },
      { property: "og:title", content: `Kopi ${cap(params.slug)} — Cuma Biji` },
    ],
  }),
  loader: async ({ context, params }) => {
    const o = await context.queryClient.ensureQueryData(originBySlugQuery(params.slug));
    if (!o) throw notFound();
  },
  component: OriginDetail,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="container-editorial py-24 text-center">
        <h1 className="font-display text-3xl text-[color:var(--coffee)]">Origin tidak ditemukan</h1>
        <Link to="/single-origin" className="mt-4 inline-block underline">
          ← Lihat semua origin
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

function OriginDetail() {
  const { slug } = Route.useParams();
  const { data: origin } = useQuery(originBySlugQuery(slug));
  const { data: products } = useQuery(productsQuery({ originSlug: slug }));

  if (!origin) return null;

  return (
    <PublicLayout>
      <section className="relative">
        <div className="h-[44vh] min-h-[320px] overflow-hidden bg-[color:var(--cream)]">
          <img
            src={IMG[slug] ?? gayoImg}
            alt={`Pemandangan kebun ${origin.name}`}
            className="h-full w-full object-cover"
            width={1920}
            height={900}
          />
        </div>
        <div className="container-editorial py-12 md:py-16">
          <Link
            to="/single-origin"
            className="inline-flex items-center gap-1 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)]"
          >
            <ChevronLeft className="h-4 w-4" /> Semua origin
          </Link>
          <p className="eyebrow mt-6">{origin.region}</p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-[color:var(--coffee)] md:text-6xl">
            {origin.name}
          </h1>
          <div className="mt-8 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="text-lg leading-relaxed text-[color:var(--ink)]">{origin.description}</p>
            </div>
            <aside className="md:col-span-4 md:col-start-9">
              <dl className="space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 text-sm">
                <Row label="Region" value={origin.region} />
                {origin.altitude && <Row label="Ketinggian" value={origin.altitude} />}
                <Row label="Asal" value="Indonesia" />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--border)]">
        <div className="container-editorial py-16">
          <p className="eyebrow">Produk dari {origin.name}</p>
          <h2 className="mt-2 font-display text-3xl text-[color:var(--coffee)]">
            Cicipi langsung
          </h2>
          {products && products.length > 0 ? (
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="Stok baru sedang disangrai" description="Cek lagi minggu depan." />
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--border)] pb-3 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</dt>
      <dd className="text-right font-medium text-[color:var(--coffee)]">{value}</dd>
    </div>
  );
}
