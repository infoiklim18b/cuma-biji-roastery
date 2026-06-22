import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Shield, ShieldOff } from "lucide-react";
import { AdminLayout, AdminMobileNav } from "@/components/admin/AdminLayout";
import { adminCustomersQuery, setUserRole } from "@/lib/admin";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pelanggan")({
  head: () => ({ meta: [{ title: "Admin — Pelanggan" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data } = useQuery(adminCustomersQuery(search));
  const { data: admins } = useQuery({
    queryKey: ["admin", "admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.user_id));
    },
  });

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    if (!confirm(isAdmin ? "Cabut akses admin?" : "Jadikan admin?")) return;
    try {
      await setUserRole(userId, "admin", !isAdmin);
      toast.success("Role diperbarui");
      qc.invalidateQueries({ queryKey: ["admin", "admin-roles"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AdminLayout title="Pelanggan">
      <AdminMobileNav />
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted-foreground)]" />
        <Input placeholder="Cari nama" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--secondary)]/40 text-xs uppercase tracking-wider text-[color:var(--muted-foreground)] text-left">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">No HP</th>
              <th className="px-4 py-3">Bergabung</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => {
              const isAdmin = admins?.has(c.id) ?? false;
              return (
                <tr key={c.id} className="border-t border-[color:var(--border)]">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[color:var(--secondary)] overflow-hidden">
                      {c.avatar_url && <img src={c.avatar_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    {c.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-[color:var(--muted-foreground)]">{new Date(c.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3">
                    {isAdmin
                      ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700"><Shield className="h-3 w-3" /> Admin</span>
                      : <span className="text-xs text-[color:var(--muted-foreground)]">Customer</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleAdmin(c.id, isAdmin)}
                      className="text-xs text-[color:var(--coffee)] inline-flex items-center gap-1"
                    >
                      {isAdmin ? <><ShieldOff className="h-3 w-3" /> Cabut admin</> : <><Shield className="h-3 w-3" /> Jadikan admin</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
