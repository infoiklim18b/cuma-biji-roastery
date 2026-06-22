import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminProductsQuery } from "@/lib/admin";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/produk/")({
  head: () => ({ meta: [{ title: "Admin — Produk" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const { data, isLoading } = useQuery(adminProductsQuery());
  const qc = useQueryClient();

  async function togglePublish(id: string, current: boolean) {
    const { error } = await supabase
      .from("products")
      .update({ is_published: !current })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(current ? "Produk disembunyikan" : "Produk dipublikasikan");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  }

  return (
    <AdminLayout title="Produk">
      <AdminMobileNav />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {data?.length ?? 0} produk
        </p>
        <Button asChild>
          <Link to="/admin/produk/baru"><Plus className="h-4 w-4 mr-1" /> Produk baru</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--secondary)]/40 text-left text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={6} className="py-10 text-center">Memuat…</td></tr>}
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-[color:var(--secondary)] overflow-hidden shrink-0">
                        {p.thumbnail && <img src={p.thumbnail} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="text-[color:var(--coffee)]">{p.name}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)] font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.kind}</td>
                  <td className="px-4 py-3">{formatIDR(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? "text-rose-700 font-medium" : ""}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(p.id, p.is_published)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        p.is_published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {p.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {p.is_published ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/produk/$id"
                      params={{ id: p.id }}
                      className="text-[color:var(--coffee)] hover:underline text-xs inline-flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
