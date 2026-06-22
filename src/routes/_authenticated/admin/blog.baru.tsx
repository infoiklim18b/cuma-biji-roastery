import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminBlogCategoriesQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { BlogFields } from "./blog.$id";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/blog/baru")({
  head: () => ({ meta: [{ title: "Admin — Artikel baru" }] }),
  component: NewBlog,
});

function NewBlog() {
  const navigate = useNavigate();
  const { data: cats } = useQuery(adminBlogCategoriesQuery());
  const [v, setV] = useState<Record<string, unknown>>({
    title: "", slug: "", excerpt: "", content: "", status: "draft", thumbnail: "",
  });

  async function save() {
    const payload = {
      ...v,
      slug: (v.slug as string) || (v.title as string).toLowerCase().trim().replace(/\s+/g, "-"),
      published_at: v.status === "published" ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase.from("blogs").insert(payload as never).select("id").single();
    if (error) return toast.error(error.message);
    toast.success("Artikel dibuat");
    navigate({ to: "/admin/blog/$id", params: { id: data!.id } });
  }

  return (
    <AdminLayout title="Artikel baru">
      <AdminMobileNav />
      <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] mb-4">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <BlogFields v={v} setV={setV} cats={cats ?? []} />
      <div className="mt-6 flex gap-2 justify-end">
        <Button onClick={save}>Simpan artikel</Button>
      </div>
    </AdminLayout>
  );
}
