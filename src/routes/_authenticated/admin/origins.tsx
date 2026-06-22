import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminOriginsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/origins")({
  head: () => ({ meta: [{ title: "Admin — Origins" }] }),
  component: AdminOrigins,
});

type OriginDraft = {
  id?: string;
  slug: string;
  name: string;
  region: string;
  description?: string | null;
  altitude?: string | null;
  hero_image?: string | null;
};

function AdminOrigins() {
  const qc = useQueryClient();
  const { data } = useQuery(adminOriginsQuery());
  const [editing, setEditing] = useState<OriginDraft | null>(null);

  function startNew() {
    setEditing({ slug: "", name: "", region: "" });
  }
  function startEdit(o: OriginDraft) {
    setEditing(o);
  }
  async function save() {
    if (!editing) return;
    const payload = {
      ...editing,
      slug: editing.slug || editing.name.toLowerCase().trim().replace(/\s+/g, "-"),
    };
    const op = editing.id
      ? supabase.from("origins").update(payload).eq("id", editing.id)
      : supabase.from("origins").insert(payload as never);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "origins"] });
    qc.invalidateQueries({ queryKey: ["origins"] });
  }
  async function remove(id: string) {
    if (!confirm("Hapus origin?")) return;
    const { error } = await supabase.from("origins").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "origins"] });
    qc.invalidateQueries({ queryKey: ["origins"] });
    toast.success("Dihapus");
  }

  return (
    <AdminLayout title="Origins">
      <AdminMobileNav />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">{data?.length ?? 0} origin</p>
        <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" /> Origin baru</Button>
      </div>

      {editing && (
        <div className="rounded-2xl border border-[color:var(--coffee)] bg-[color:var(--card)] p-5 mb-4 grid gap-3 sm:grid-cols-2">
          <Input placeholder="Nama" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          <Input placeholder="Slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          <Input placeholder="Region" value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} />
          <Input placeholder="Altitude (mdpl)" value={editing.altitude ?? ""} onChange={(e) => setEditing({ ...editing, altitude: e.target.value })} />
          <Input placeholder="URL hero image" value={editing.hero_image ?? ""} onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })} className="sm:col-span-2" />
          <Textarea rows={3} placeholder="Deskripsi" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="sm:col-span-2" />
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditing(null)}><X className="h-4 w-4 mr-1" /> Batal</Button>
            <Button onClick={save}><Check className="h-4 w-4 mr-1" /> Simpan</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((o) => (
          <div key={o.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
            {o.hero_image && <img src={o.hero_image} alt="" className="h-32 w-full object-cover" />}
            <div className="p-4">
              <p className="font-display text-base text-[color:var(--coffee)]">{o.name}</p>
              <p className="text-xs text-[color:var(--muted-foreground)]">{o.region}</p>
              <div className="mt-3 flex gap-2 justify-end">
                <button onClick={() => startEdit(o)} className="text-xs text-[color:var(--coffee)] inline-flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                <button onClick={() => remove(o.id)} className="text-xs text-rose-700 inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
