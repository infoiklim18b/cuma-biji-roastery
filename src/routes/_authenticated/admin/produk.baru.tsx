import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminOriginsQuery, adminCategoriesQuery } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/produk/baru")({
  head: () => ({ meta: [{ title: "Admin — Produk baru" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const { data: origins } = useQuery(adminOriginsQuery());
  const { data: categories } = useQuery(adminCategoriesQuery());
  const [saving, setSaving] = useState(false);

  async function save(values: Record<string, unknown>): Promise<void> {
    setSaving(true);
    const { data, error } = await supabase
      .from("products")
      .insert(values as never)
      .select("id")
      .single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Produk dibuat");
    navigate({ to: "/admin/produk/$id", params: { id: data!.id } });
  }

  return (
    <AdminLayout title="Produk baru">
      <AdminMobileNav />
      <Link to="/admin/produk" className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <ProductForm
        defaultValues={{
          name: "",
          slug: "",
          kind: "single_origin",
          price: 0,
          stock: 0,
          weight_g: 200,
          description: "",
          tasting_notes: [],
          is_published: false,
          roast_level: "medium",
          process: "washed",
        }}
        origins={origins ?? []}
        categories={categories ?? []}
        onSubmit={save}
        saving={saving}
      />
    </AdminLayout>
  );
}
