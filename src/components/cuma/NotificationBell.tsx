import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notificationsQuery, unreadCountQuery } from "@/lib/cart";
import { useUserId } from "@/lib/use-user";
import { formatDate } from "@/lib/format";

export function NotificationBell() {
  const { userId } = useUserId();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data: unread = 0 } = useQuery({ ...unreadCountQuery(userId), enabled: !!userId });
  const { data: items = [] } = useQuery({ ...notificationsQuery(userId), enabled: !!userId && open });

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications", userId] });
    qc.invalidateQueries({ queryKey: ["notif-unread", userId] });
  }

  async function markAllRead() {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications", userId] });
    qc.invalidateQueries({ queryKey: ["notif-unread", userId] });
  }

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 hover:bg-[color:var(--secondary)]"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--coffee)] px-1 text-[10px] font-medium text-[color:var(--cream)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
              <p className="font-display text-base text-[color:var(--coffee)]">Notifikasi</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)]"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-[color:var(--muted-foreground)]">
                  Belum ada notifikasi.
                </p>
              ) : (
                items.slice(0, 10).map((n) => {
                  const target = n.link ?? "/akun";
                  return (
                    <Link
                      key={n.id}
                      to={target}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className={`block border-b border-[color:var(--border)] px-4 py-3 last:border-0 hover:bg-[color:var(--secondary)] ${
                        n.is_read ? "" : "bg-[color:var(--cream)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-[color:var(--coffee)]">{n.title}</p>
                        {n.is_read && <Check className="h-3 w-3 shrink-0 text-[color:var(--muted-foreground)]" />}
                      </div>
                      {n.body && (
                        <p className="mt-1 line-clamp-2 text-xs text-[color:var(--muted-foreground)]">{n.body}</p>
                      )}
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)]">
                        {formatDate(n.created_at)}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
            <Link
              to="/akun/notifikasi"
              onClick={() => setOpen(false)}
              className="block border-t border-[color:var(--border)] py-3 text-center text-xs text-[color:var(--coffee)] hover:bg-[color:var(--secondary)]"
            >
              Lihat semua →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
