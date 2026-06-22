import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminCouponsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/voucher")({
  head: () => ({ meta: [{ title: "Admin — Voucher" }] }),
  component: AdminCoupons,
});

function AdminCoupons() {
  const qc = useQueryClient();
  const { data } = useQuery(adminCouponsQuery());
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  async function save() {
    if (!editing) return;
    const payload = {
      ...editing,
      code: (editing.code as string).toUpperCase().trim(),
      value: Number(editing.value),
      min_subtotal: Number(editing.min_subtotal ?? 0),
      max_uses: editing.max_uses ? Number(editing.max_uses) : null,
    };
    const op = editing.id
      ? supabase.from("coupons").update(payload as never).eq("id", editing.id as string)
      : supabase.from("coupons").insert(payload as never);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }
  async function remove(id: string) {
    if (!confirm("Hapus voucher?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }
  async function toggleActive(id: string, current: boolean) {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }

  return (
    <AdminLayout title="Voucher">
      <AdminMobileNav />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">{data?.length ?? 0} voucher</p>
        <Button onClick={() => setEditing({ code: "", type: "percent", value: 10, is_active: true, min_subtotal: 0 })}>
          <Plus className="h-4 w-4 mr-1" /> Voucher baru
        </Button>
      </div>

      {editing && (
        <div className="rounded-2xl border border-[color:var(--coffee)] bg-[color:var(--card)] p-5 mb-4 grid gap-3 sm:grid-cols-2">
          <Field label="Kode"><Input value={(editing.code as string) ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></Field>
          <Field label="Tipe">
            <Select value={(editing.type as string) ?? "percent"} onValueChange={(x) => setEditing({ ...editing, type: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Persen</SelectItem>
                <SelectItem value="amount">Nominal</SelectItem>
                <SelectItem value="free_shipping">Gratis ongkir</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nilai"><Input type="number" value={(editing.value as number) ?? 0} onChange={(e) => setEditing({ ...editing, value: e.target.value })} /></Field>
          <Field label="Min subtotal"><Input type="number" value={(editing.min_subtotal as number) ?? 0} onChange={(e) => setEditing({ ...editing, min_subtotal: e.target.value })} /></Field>
          <Field label="Max pemakaian (opsional)"><Input type="number" value={(editing.max_uses as number) ?? ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value })} /></Field>
          <div className="flex items-center justify-between sm:col-span-1">
            <Label>Aktif</Label>
            <Switch checked={!!editing.is_active} onCheckedChange={(c) => setEditing({ ...editing, is_active: c })} />
          </div>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--secondary)]/40 text-xs uppercase tracking-wider text-[color:var(--muted-foreground)] text-left">
            <tr>
              <th className="px-4 py-3">Kode</th><th className="px-4 py-3">Tipe</th><th className="px-4 py-3">Nilai</th>
              <th className="px-4 py-3">Pakai</th><th className="px-4 py-3">Aktif</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-[color:var(--border)]">
                <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3 text-xs">{c.type}</td>
                <td className="px-4 py-3">{c.value}{c.type === "percent" ? "%" : ""}</td>
                <td className="px-4 py-3">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td className="px-4 py-3"><Switch checked={c.is_active} onCheckedChange={() => toggleActive(c.id, c.is_active)} /></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(c as Record<string, unknown>)} className="text-xs text-[color:var(--coffee)] mr-3">Edit</button>
                  <button onClick={() => remove(c.id)} className="text-xs text-rose-700"><Trash2 className="h-3 w-3 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div><Label className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</Label><div className="mt-1">{children}</div></div>
  );
}
