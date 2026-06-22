import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminProductByIdQuery, adminOriginsQuery, adminCategoriesQuery } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/produk/$id")({
  head: ({ params }) => ({ meta: [{ title: `Admin — Edit produk` }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery(adminProductByIdQuery(id));
  const { data: origins } = useQuery(adminOriginsQuery());
  const { data: categories } = useQuery(adminCategoriesQuery());
  const [saving, setSaving] = useState(false);

  if (isLoading || !product) {
    return <AdminLayout title="Memuat…"><div /></AdminLayout>;
  }

  async function save(values: Record<string, unknown>): Promise<void> {
    setSaving(true);
    const { error } = await supabase.from("products").update(values as never).eq("id", id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Produk tersimpan");
  }

  async function remove() {
    if (!confirm("Hapus produk ini?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produk dihapus");
    navigate({ to: "/admin/produk" });
  }

  return (
    <AdminLayout title={`Edit: ${product.name}`}>
      <AdminMobileNav />
      <Link to="/admin/produk" className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <ProductForm
        defaultValues={product}
        origins={origins ?? []}
        categories={categories ?? []}
        onSubmit={save}
        onDelete={remove}
        saving={saving}
      />
    </AdminLayout>
  );
}
