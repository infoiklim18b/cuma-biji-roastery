import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminBlogsQuery } from "@/lib/admin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/blog/")({
  head: () => ({ meta: [{ title: "Admin — Jurnal" }] }),
  component: AdminBlogs,
});

function AdminBlogs() {
  const { data } = useQuery(adminBlogsQuery());
  return (
    <AdminLayout title="Jurnal">
      <AdminMobileNav />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[color:var(--muted-foreground)]">{data?.length ?? 0} artikel</p>
        <Button asChild><Link to="/admin/blog/baru"><Plus className="h-4 w-4 mr-1" /> Artikel baru</Link></Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((b) => (
          <Link key={b.id} to="/admin/blog/$id" params={{ id: b.id }} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden hover:border-[color:var(--coffee)]">
            {b.thumbnail && <img src={b.thumbnail} alt="" className="h-32 w-full object-cover" />}
            <div className="p-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
                {b.status} · {b.published_at ? new Date(b.published_at).toLocaleDateString("id-ID") : "Belum publish"}
              </p>
              <p className="font-display text-base text-[color:var(--coffee)] mt-1">{b.title}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--coffee)]"><Pencil className="h-3 w-3" /> Edit</span>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
