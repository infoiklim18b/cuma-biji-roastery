import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

type Origin = { id: string; name: string };
type Category = { id: string; name: string };

type FormValues = {
  name: string;
  slug: string;
  kind: string;
  price: number;
  compare_price?: number | null;
  stock: number;
  weight_g?: number | null;
  description?: string | null;
  thumbnail?: string | null;
  roast_level?: string | null;
  process?: string | null;
  tasting_notes?: string[] | null;
  aroma?: number | null;
  body?: number | null;
  acidity?: number | null;
  is_published?: boolean;
  is_featured?: boolean;
  origin_id?: string | null;
  category_id?: string | null;
};

export function ProductForm({
  defaultValues,
  origins,
  categories,
  onSubmit,
  onDelete,
  saving,
}: {
  defaultValues: Partial<FormValues> & Record<string, unknown>;
  origins: Origin[];
  categories: Category[];
  onSubmit: (v: Record<string, unknown>) => Promise<void> | void;
  onDelete?: () => void;
  saving?: boolean;
}) {
  const [v, setV] = useState<FormValues>({
    name: "",
    slug: "",
    kind: "single_origin",
    price: 0,
    stock: 0,
    weight_g: 200,
    is_published: false,
    is_featured: false,
    tasting_notes: [],
    ...(defaultValues as Partial<FormValues>),
  });
  const [notesText, setNotesText] = useState((defaultValues.tasting_notes as string[] | undefined)?.join(", ") ?? "");

  useEffect(() => {
    setV((p) => ({ ...p, ...(defaultValues as Partial<FormValues>) }));
    setNotesText((defaultValues.tasting_notes as string[] | undefined)?.join(", ") ?? "");
  }, [defaultValues]);

  function set<K extends keyof FormValues>(k: K, val: FormValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...v,
      slug: v.slug || v.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      price: Number(v.price),
      stock: Number(v.stock),
      weight_g: v.weight_g ? Number(v.weight_g) : null,
      compare_price: v.compare_price ? Number(v.compare_price) : null,
      tasting_notes: notesText
        ? notesText.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      aroma: v.aroma ? Number(v.aroma) : null,
      body: v.body ? Number(v.body) : null,
      acidity: v.acidity ? Number(v.acidity) : null,
    };
    onSubmit(payload as Record<string, unknown>);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card title="Informasi dasar">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama">
              <Input value={v.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label="Slug (otomatis jika kosong)">
              <Input value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <Field label="Jenis">
              <Select value={v.kind} onValueChange={(x) => set("kind", x)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_origin">Single Origin</SelectItem>
                  <SelectItem value="blend">Blend</SelectItem>
                  <SelectItem value="accessory">Aksesoris</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Kategori">
              <Select value={v.category_id ?? ""} onValueChange={(x) => set("category_id", x || null)}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Deskripsi" full>
              <Textarea rows={4} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
        </Card>

        {v.kind !== "accessory" && (
          <Card title="Profil kopi">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Origin">
                <Select value={v.origin_id ?? ""} onValueChange={(x) => set("origin_id", x || null)}>
                  <SelectTrigger><SelectValue placeholder="Pilih origin" /></SelectTrigger>
                  <SelectContent>
                    {origins.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Roast level">
                <Select value={v.roast_level ?? "medium"} onValueChange={(x) => set("roast_level", x)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="medium_dark">Medium dark</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Proses">
                <Select value={v.process ?? "washed"} onValueChange={(x) => set("process", x)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="washed">Washed</SelectItem>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="honey">Honey</SelectItem>
                    <SelectItem value="wet_hulled">Wet hulled</SelectItem>
                    <SelectItem value="anaerobic">Anaerobic</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tasting notes (pisahkan koma)" full>
                <Input value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="cokelat, jeruk, karamel" />
              </Field>
              <Field label="Aroma (1-5)">
                <Input type="number" min={0} max={5} value={v.aroma ?? ""} onChange={(e) => set("aroma", Number(e.target.value))} />
              </Field>
              <Field label="Body (1-5)">
                <Input type="number" min={0} max={5} value={v.body ?? ""} onChange={(e) => set("body", Number(e.target.value))} />
              </Field>
              <Field label="Acidity (1-5)">
                <Input type="number" min={0} max={5} value={v.acidity ?? ""} onChange={(e) => set("acidity", Number(e.target.value))} />
              </Field>
            </div>
          </Card>
        )}

        <Card title="Media">
          <Field label="URL thumbnail">
            <Input value={v.thumbnail ?? ""} onChange={(e) => set("thumbnail", e.target.value)} placeholder="https://… atau path bucket" />
          </Field>
          {v.thumbnail && (
            <img src={v.thumbnail} alt="" className="mt-3 h-40 w-40 object-cover rounded-md border border-[color:var(--border)]" />
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Harga & stok">
          <Field label="Harga (Rp)">
            <Input type="number" min={0} value={v.price} onChange={(e) => set("price", Number(e.target.value))} required />
          </Field>
          <Field label="Harga coret (opsional)">
            <Input type="number" min={0} value={v.compare_price ?? ""} onChange={(e) => set("compare_price", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="Stok">
            <Input type="number" min={0} value={v.stock} onChange={(e) => set("stock", Number(e.target.value))} required />
          </Field>
          <Field label="Berat (gram)">
            <Input type="number" min={0} value={v.weight_g ?? ""} onChange={(e) => set("weight_g", Number(e.target.value))} />
          </Field>
        </Card>

        <Card title="Visibilitas">
          <div className="flex items-center justify-between">
            <Label>Publikasikan</Label>
            <Switch checked={!!v.is_published} onCheckedChange={(c) => set("is_published", c)} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <Label>Tampilkan di featured</Label>
            <Switch checked={!!v.is_featured} onCheckedChange={(c) => set("is_featured", c)} />
          </div>
        </Card>

        <div className="space-y-2">
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Menyimpan…" : "Simpan produk"}
          </Button>
          {onDelete && (
            <Button type="button" variant="outline" className="w-full text-rose-700" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Hapus produk
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
      <h3 className="font-display text-base text-[color:var(--coffee)]">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
