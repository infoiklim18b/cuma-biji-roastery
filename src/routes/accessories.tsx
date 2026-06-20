import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { ProductCard } from "@/components/cuma/ProductCard";
import { EmptyState } from "@/components/cuma/EmptyState";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/accessories")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Aksesoris Seduh — Cuma Biji" },
      { name: "description", content: "V60, kettle gooseneck, grinder. Alat seduh pilihan untuk specialty coffee." },
    ],
  }),
  component: AccessoryPage,
});

function AccessoryPage() {
  const { data } = useQuery(productsQuery({ kind: "accessory", sort: "best" }));
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Aksesoris"
        title="Alat seduh pilihan."
        description="V60, kettle gooseneck, grinder — kurasi alat untuk menyeduh specialty coffee di rumah."
      />
      <section className="container-editorial py-16">
        {data && data.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Aksesoris segera datang" />
        )}
      </section>
    </PublicLayout>
  );
}
