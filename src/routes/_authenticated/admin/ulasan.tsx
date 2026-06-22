import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Star } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminReviewsQuery } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/ulasan")({
  head: () => ({ meta: [{ title: "Admin — Ulasan" }] }),
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const { data } = useQuery(adminReviewsQuery());

  async function remove(id: string) {
    if (!confirm("Hapus ulasan?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
  }

  return (
    <AdminLayout title="Ulasan">
      <AdminMobileNav />
      <div className="space-y-3">
        {(data ?? []).map((r) => {
          const product = r.products as { name?: string; slug?: string } | null;
          const profile = r.profiles as { full_name?: string } | null;
          return (
            <div key={r.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[color:var(--coffee)]">{product?.name ?? "Produk"}</p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    {profile?.full_name ?? "Anon"} · {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r.rating}
                  </span>
                  <button onClick={() => remove(r.id)} className="text-rose-700"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {r.body && <p className="mt-2 text-sm text-[color:var(--ink)]">{r.body}</p>}
            </div>
          );
        })}
        {(data ?? []).length === 0 && (
          <p className="text-sm text-[color:var(--muted-foreground)] text-center py-10">Belum ada ulasan.</p>
        )}
      </div>
    </AdminLayout>
  );
}
