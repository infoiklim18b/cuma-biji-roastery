import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { storeSettingsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pengaturan")({
  head: () => ({ meta: [{ title: "Admin — Pengaturan" }] }),
  component: AdminSettings,
});

type Bank = "bca" | "mandiri" | "bni" | "bri";
type BankAccount = { bank: Bank; number: string; holder: string };

function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery(storeSettingsQuery());
  const [v, setV] = useState<Record<string, unknown>>({});
  useEffect(() => { if (data) setV(data as Record<string, unknown>); }, [data]);

  const banks = ((v.bank_accounts as BankAccount[]) ?? []);

  async function save() {
    const { error } = await supabase.from("store_settings").update(v as never).eq("id", true);
    if (error) return toast.error(error.message);
    toast.success("Pengaturan disimpan");
    qc.invalidateQueries({ queryKey: ["store-settings"] });
  }

  function updateBank(i: number, patch: Partial<BankAccount>) {
    const next = [...banks];
    next[i] = { ...next[i], ...patch };
    setV({ ...v, bank_accounts: next });
  }
  function addBank() {
    setV({ ...v, bank_accounts: [...banks, { bank: "bca", number: "", holder: "" }] });
  }
  function removeBank(i: number) {
    setV({ ...v, bank_accounts: banks.filter((_, idx) => idx !== i) });
  }

  return (
    <AdminLayout title="Pengaturan toko">
      <AdminMobileNav />
      <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
        <Card title="Informasi toko">
          <Field label="Nama"><Input value={(v.store_name as string) ?? ""} onChange={(e) => setV({ ...v, store_name: e.target.value })} /></Field>
          <Field label="Email"><Input value={(v.store_email as string) ?? ""} onChange={(e) => setV({ ...v, store_email: e.target.value })} /></Field>
          <Field label="Telepon"><Input value={(v.store_phone as string) ?? ""} onChange={(e) => setV({ ...v, store_phone: e.target.value })} /></Field>
          <Field label="Alamat"><Input value={(v.store_address as string) ?? ""} onChange={(e) => setV({ ...v, store_address: e.target.value })} /></Field>
          <Field label="Kota asal pengiriman"><Input value={(v.shipping_origin_city as string) ?? ""} onChange={(e) => setV({ ...v, shipping_origin_city: e.target.value })} /></Field>
          <Field label="Threshold stok menipis"><Input type="number" value={(v.low_stock_threshold as number) ?? 10} onChange={(e) => setV({ ...v, low_stock_threshold: Number(e.target.value) })} /></Field>
        </Card>

        <Card title="Rekening bank">
          <div className="space-y-3">
            {banks.map((b, i) => (
              <div key={i} className="rounded-lg border border-[color:var(--border)] p-3 grid gap-2">
                <div className="flex gap-2">
                  <Select value={b.bank} onValueChange={(x) => updateBank(i, { bank: x as Bank })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bca">BCA</SelectItem>
                      <SelectItem value="mandiri">Mandiri</SelectItem>
                      <SelectItem value="bni">BNI</SelectItem>
                      <SelectItem value="bri">BRI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Nomor rekening" value={b.number} onChange={(e) => updateBank(i, { number: e.target.value })} />
                  <button onClick={() => removeBank(i)} className="text-rose-700"><Trash2 className="h-4 w-4" /></button>
                </div>
                <Input placeholder="Atas nama" value={b.holder} onChange={(e) => updateBank(i, { holder: e.target.value })} />
              </div>
            ))}
            <Button variant="outline" onClick={addBank} className="w-full"><Plus className="h-4 w-4 mr-1" /> Tambah rekening</Button>
          </div>
        </Card>
      </div>
      <div className="mt-6 max-w-4xl flex justify-end">
        <Button onClick={save}>Simpan pengaturan</Button>
      </div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3">
      <h3 className="font-display text-base text-[color:var(--coffee)]">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div><Label className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</Label><div className="mt-1">{children}</div></div>
  );
}
