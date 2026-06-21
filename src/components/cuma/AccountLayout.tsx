import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, MapPin, Heart, Package, Star, User as UserIcon, Settings, Bell } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "./PublicLayout";

const nav = [
  { to: "/akun", label: "Dashboard", Icon: UserIcon, exact: true },
  { to: "/akun/profil", label: "Profil", Icon: Settings, exact: true },
  { to: "/akun/pesanan", label: "Pesanan saya", Icon: Package, exact: false },
  { to: "/akun/notifikasi", label: "Notifikasi", Icon: Bell, exact: true },
  { to: "/akun/alamat", label: "Alamat", Icon: MapPin, exact: true },
  { to: "/akun/wishlist", label: "Wishlist", Icon: Heart, exact: true },
  { to: "/akun/review", label: "Review saya", Icon: Star, exact: true },
] as const;

export function AccountLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setName((data.user?.user_metadata?.full_name as string) ?? "");
    });
  }, []);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Sampai jumpa lagi.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <PublicLayout>
      <div className="container-editorial py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <aside className="md:col-span-3">
            <p className="eyebrow">Akun</p>
            <h2 className="mt-2 truncate font-display text-2xl text-[color:var(--coffee)]">
              {name || "Halo!"}
            </h2>
            <p className="mt-1 truncate text-xs text-[color:var(--muted-foreground)]">{email}</p>
            <nav className="mt-8 flex flex-col gap-1 text-sm">
              {nav.map(({ to, label, Icon, exact }) => (
                <Link
                  key={to}
                  to={to}
                  activeProps={{ className: "active" }}
                  activeOptions={{ exact }}
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-[color:var(--secondary)] [&.active]:bg-[color:var(--secondary)] [&.active]:font-medium [&.active]:text-[color:var(--coffee)]"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-[color:var(--destructive)] hover:bg-[color:var(--secondary)]"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </nav>
          </aside>

          <section className="md:col-span-9">
            <h1 className="mb-6 font-display text-3xl font-semibold text-[color:var(--coffee)]">
              {title}
            </h1>
            {children}
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
