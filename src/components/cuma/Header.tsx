import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

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
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => active && setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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
        <div className="flex items-center gap-2">
          <Link
            to={signedIn ? "/akun" : "/auth"}
            className="rounded-full p-2 hover:bg-[color:var(--secondary)] transition-colors"
            aria-label={signedIn ? "Akun saya" : "Masuk"}
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/keranjang"
            className="rounded-full p-2 hover:bg-[color:var(--secondary)] transition-colors"
            aria-label="Keranjang"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
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
