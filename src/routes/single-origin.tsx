import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { originsQuery } from "@/lib/queries";
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

export const Route = createFileRoute("/single-origin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Single Origin Nusantara — Cuma Biji" },
      { name: "description", content: "Enam dataran tinggi, enam karakter kopi: Gayo, Toraja, Kintamani, Java Preanger, Flores Bajawa, Papua." },
      { property: "og:title", content: "Single Origin Nusantara — Cuma Biji" },
    ],
  }),
  component: SingleOriginIndex,
});

function SingleOriginIndex() {
  const { data: origins } = useQuery(originsQuery());

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Single Origin"
        title="Enam dataran tinggi, enam karakter."
        description="Setiap kebun bercerita. Kami merawat keunikan tiap origin agar sampai utuh di cangkirmu."
      />

      <section className="container-editorial py-16 md:py-24">
        <div className="grid gap-12 md:gap-16">
          {origins?.map((o, i) => (
            <Link
              key={o.slug}
              to="/single-origin/$slug"
              params={{ slug: o.slug }}
              className={`group grid gap-8 md:grid-cols-12 md:items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="md:col-span-6">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[color:var(--cream)]">
                  <img
                    src={IMG[o.slug] ?? gayoImg}
                    alt={`Kopi ${o.name}`}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="md:col-span-6">
                <p className="eyebrow">0{i + 1} · {o.region}</p>
                <h2 className="mt-3 font-display text-4xl font-semibold text-[color:var(--coffee)] group-hover:underline md:text-5xl">
                  {o.name}
                </h2>
                <p className="mt-4 text-[color:var(--muted-foreground)]">{o.description}</p>
                {o.altitude && (
                  <p className="mt-4 text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    Ketinggian · {o.altitude}
                  </p>
                )}
                <span className="mt-6 inline-block text-sm font-medium text-[color:var(--coffee)] underline">
                  Lihat detail origin →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
