import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminBlogByIdQuery, adminBlogCategoriesQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  head: () => ({ meta: [{ title: "Admin — Edit artikel" }] }),
  component: EditBlog,
});

function EditBlog() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: post, isLoading } = useQuery(adminBlogByIdQuery(id));
  const { data: cats } = useQuery(adminBlogCategoriesQuery());
  const [v, setV] = useState<Record<string, unknown>>({});
  useEffect(() => { if (post) setV(post); }, [post]);

  if (isLoading || !post) return <AdminLayout title="Memuat…"><div /></AdminLayout>;

  async function save() {
    const payload = {
      ...v,
      slug: (v.slug as string) || (v.title as string)?.toLowerCase().trim().replace(/\s+/g, "-"),
      published_at: v.status === "published" && !v.published_at ? new Date().toISOString() : v.published_at,
    };
    const { error } = await supabase.from("blogs").update(payload as never).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Artikel tersimpan");
  }
  async function remove() {
    if (!confirm("Hapus artikel?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus");
    navigate({ to: "/admin/blog" });
  }

  return (
    <AdminLayout title={`Edit: ${post.title}`}>
      <AdminMobileNav />
      <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <BlogFields v={v} setV={setV} cats={cats ?? []} />
      <div className="mt-6 flex gap-2 justify-end">
        <Button variant="outline" className="text-rose-700" onClick={remove}><Trash2 className="h-4 w-4 mr-1" /> Hapus</Button>
        <Button onClick={save}>Simpan</Button>
      </div>
    </AdminLayout>
  );
}

export function BlogFields({
  v, setV, cats,
}: { v: Record<string, unknown>; setV: (n: Record<string, unknown>) => void; cats: { id: string; name: string }[] }) {
  const upd = (k: string, val: unknown) => setV({ ...v, [k]: val });
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
          <Field label="Judul"><Input value={(v.title as string) ?? ""} onChange={(e) => upd("title", e.target.value)} /></Field>
          <Field label="Slug"><Input value={(v.slug as string) ?? ""} onChange={(e) => upd("slug", e.target.value)} /></Field>
          <Field label="Excerpt"><Textarea rows={2} value={(v.excerpt as string) ?? ""} onChange={(e) => upd("excerpt", e.target.value)} /></Field>
          <Field label="Konten (Markdown)"><Textarea rows={16} value={(v.content as string) ?? ""} onChange={(e) => upd("content", e.target.value)} className="font-mono text-sm" /></Field>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
          <h3 className="font-display text-base text-[color:var(--coffee)]">SEO</h3>
          <Field label="SEO title"><Input value={(v.seo_title as string) ?? ""} onChange={(e) => upd("seo_title", e.target.value)} /></Field>
          <Field label="SEO description"><Textarea rows={2} value={(v.seo_description as string) ?? ""} onChange={(e) => upd("seo_description", e.target.value)} /></Field>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3">
          <Field label="Status">
            <Select value={(v.status as string) ?? "draft"} onValueChange={(x) => upd("status", x)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Kategori">
            <Select value={(v.category_id as string) ?? ""} onValueChange={(x) => upd("category_id", x)}>
              <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>
                {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Thumbnail URL"><Input value={(v.thumbnail as string) ?? ""} onChange={(e) => upd("thumbnail", e.target.value)} /></Field>
          {v.thumbnail ? <img src={v.thumbnail as string} alt="" className="rounded-md w-full" /> : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
