import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { cartQuery } from "@/lib/cart";
import { useUserId } from "@/lib/use-user";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/single-origin", label: "Single Origin" },
  { to: "/blend", label: "Blend" },
  { to: "/custom", label: "Custom Coffee" },
  { to: "/accessories", label: "Aksesoris" },
  { to: "/blog", label: "Jurnal" },
  { to: "/tentang", label: "Tentang" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { userId } = useUserId();
  const navigate = useNavigate();
  const signedIn = !!userId;

  const { data: cart } = useQuery({ ...cartQuery(userId), enabled: !!userId });
  const cartCount = cart?.items.reduce((s, i) => s + i.qty, 0) ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--background)]/85 backdrop-blur">
      <div className="container-editorial flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden lg:flex items-center gap-7 text-sm text-[color:var(--ink)]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-[color:var(--coffee)] transition-colors"
              activeProps={{ className: "text-[color:var(--coffee)] font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          {signedIn && <NotificationBell />}
          <Link
            to={signedIn ? "/akun" : "/auth"}
            className="rounded-full p-2 hover:bg-[color:var(--secondary)] transition-colors"
            aria-label={signedIn ? "Akun saya" : "Masuk"}
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              if (!signedIn) {
                navigate({ to: "/auth" });
                return;
              }
              navigate({ to: "/keranjang" });
            }}
            className="relative rounded-full p-2 hover:bg-[color:var(--secondary)] transition-colors"
            aria-label="Keranjang"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[color:var(--coffee)] px-1 text-[10px] font-medium text-[color:var(--cream)]">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="rounded-full p-2 lg:hidden hover:bg-[color:var(--secondary)]"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[color:var(--border)] bg-[color:var(--background)]">
          <nav className="container-editorial flex flex-col py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="py-3 text-sm border-b border-[color:var(--border)] last:border-0"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// Re-export so legacy unused import warnings stay quiet
export { supabase };
