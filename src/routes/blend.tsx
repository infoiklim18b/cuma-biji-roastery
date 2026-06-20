import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { ProductCard } from "@/components/cuma/ProductCard";
import { EmptyState } from "@/components/cuma/EmptyState";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/blend")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "House Blend — Cuma Biji" },
      { name: "description", content: "Racikan blend kami untuk espresso dan daily cup." },
      { property: "og:title", content: "House Blend — Cuma Biji" },
    ],
  }),
  component: BlendPage,
});

function BlendPage() {
  const { data } = useQuery(productsQuery({ kind: "blend", sort: "best" }));
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Blend"
        title="Racikan harmoni Nusantara."
        description="Kami pasangkan dua atau tiga origin agar saling melengkapi: body penuh, manis seimbang, finish bersih."
      />
      <section className="container-editorial py-16">
        {data && data.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada blend" />
        )}
      </section>
    </PublicLayout>
  );
}
