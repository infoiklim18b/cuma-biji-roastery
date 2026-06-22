import { Link, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  MapPin,
  Tags,
  BookOpen,
  Ticket,
  Users,
  Star,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/cuma/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { to: "/admin/pembayaran", label: "Pembayaran", icon: CreditCard },
  { to: "/admin/produk", label: "Produk", icon: Package },
  { to: "/admin/origins", label: "Origin", icon: MapPin },
  { to: "/admin/kategori", label: "Kategori", icon: Tags },
  { to: "/admin/blog", label: "Jurnal", icon: BookOpen },
  { to: "/admin/voucher", label: "Voucher", icon: Ticket },
  { to: "/admin/pelanggan", label: "Pelanggan", icon: Users },
  { to: "/admin/ulasan", label: "Ulasan", icon: Star },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
] as const;

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex w-full bg-[color:var(--background)]">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--card)]">
        <div className="px-5 py-5 border-b border-[color:var(--border)]">
          <Logo />
          <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            Admin Console
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-[color:var(--secondary)] text-[color:var(--coffee)] font-medium border-l-2 border-[color:var(--coffee)]"
                    : "text-[color:var(--ink)] hover:bg-[color:var(--secondary)]/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[color:var(--border)] p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)] rounded-md"
          >
            <ExternalLink className="h-4 w-4" /> Lihat storefront
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)] rounded-md"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:var(--background)]/90 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-6">
            <h1 className="font-display text-xl text-[color:var(--coffee)]">{title}</h1>
            <div className="md:hidden">
              <Logo />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-[1400px] w-full">{children}</main>
      </div>
    </div>
  );
}

export function AdminMobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--card)] flex overflow-x-auto">
      {nav.slice(0, 6).map((n) => {
        const Icon = n.icon;
        const active = path === n.to || (!n.exact && path.startsWith(n.to + "/"));
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`flex-1 min-w-[64px] flex flex-col items-center gap-1 py-2 text-[10px] ${
              active ? "text-[color:var(--coffee)]" : "text-[color:var(--muted-foreground)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}
