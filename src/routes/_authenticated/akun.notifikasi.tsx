import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { EmptyState } from "@/components/cuma/EmptyState";
import { notificationsQuery } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/use-user";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/akun/notifikasi")({
  head: () => ({ meta: [{ title: "Notifikasi — Cuma Biji" }] }),
  component: NotifPage,
});

function NotifPage() {
  const { userId } = useUserId();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ ...notificationsQuery(userId), enabled: !!userId });

  async function markAll() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications", userId] });
    qc.invalidateQueries({ queryKey: ["notif-unread", userId] });
  }

  return (
    <AccountLayout title="Notifikasi">
      {isLoading ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">Memuat…</p>
      ) : data.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" description="Update pesananmu akan muncul di sini." />
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button onClick={markAll} className="text-xs text-[color:var(--coffee)] underline">
              Tandai semua dibaca
            </button>
          </div>
          <div className="grid gap-2">
            {data.map((n) => (
              <Link
                key={n.id}
                to={n.link ?? "/akun"}
                onClick={() => supabase.from("notifications").update({ is_read: true }).eq("id", n.id)}
                className={`flex items-start justify-between gap-3 rounded-2xl border p-4 ${
                  n.is_read
                    ? "border-[color:var(--border)] bg-[color:var(--card)]"
                    : "border-[color:var(--coffee)] bg-[color:var(--cream)]"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-[color:var(--coffee)]">{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{n.body}</p>}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]">
                    {formatDate(n.created_at)}
                  </p>
                </div>
                {n.is_read && <Check className="h-4 w-4 shrink-0 text-[color:var(--muted-foreground)]" />}
              </Link>
            ))}
          </div>
        </>
      )}
    </AccountLayout>
  );
}
