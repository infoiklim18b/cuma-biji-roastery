import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminCategoriesQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/kategori")({
  head: () => ({ meta: [{ title: "Admin — Kategori" }] }),
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const { data } = useQuery(adminCategoriesQuery());
  const [name, setName] = useState("");

  async function add() {
    if (!name) return;
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
    const { error } = await supabase.from("categories").insert({ name, slug } as never);
    if (error) return toast.error(error.message);
    setName("");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    toast.success("Kategori ditambahkan");
  }
  async function remove(id: string) {
    if (!confirm("Hapus?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  }

  return (
    <AdminLayout title="Kategori">
      <AdminMobileNav />
      <div className="flex gap-2 mb-4 max-w-md">
        <Input placeholder="Nama kategori baru" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </div>
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] divide-y divide-[color:var(--border)] max-w-md">
        {(data ?? []).map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-[color:var(--coffee)]">{c.name}</p>
              <p className="text-xs text-[color:var(--muted-foreground)] font-mono">{c.slug}</p>
            </div>
            <button onClick={() => remove(c.id)} className="text-rose-700"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="p-4 text-sm text-[color:var(--muted-foreground)]">Belum ada kategori.</p>}
      </div>
    </AdminLayout>
  );
}
