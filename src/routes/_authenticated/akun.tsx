import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, MapPin, Heart, Package, Star, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/cuma/PublicLayout";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({ meta: [{ title: "Akun saya — Cuma Biji" }] }),
  component: AccountHome,
});

function AccountHome() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setName((data.user?.user_metadata?.full_name as string) ?? "");
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Sampai jumpa lagi.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <PublicLayout>
      <div className="container-editorial py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <aside className="md:col-span-3">
            <p className="eyebrow">Akun</p>
            <h1 className="mt-2 font-display text-3xl text-[color:var(--coffee)]">{name || "Halo!"}</h1>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{email}</p>
            <nav className="mt-8 flex flex-col gap-1 text-sm">
              {[
                ["/akun", UserIcon, "Profil"],
                ["/akun/pesanan", Package, "Pesanan saya"],
                ["/akun/alamat", MapPin, "Alamat"],
                ["/akun/wishlist", Heart, "Wishlist"],
                ["/akun/review", Star, "Review saya"],
              ].map(([to, Icon, label]) => {
                const I = Icon as typeof UserIcon;
                return (
                  <Link
                    key={to as string}
                    to={to as string}
                    className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-[color:var(--secondary)] [&.active]:bg-[color:var(--secondary)] [&.active]:font-medium"
                    activeProps={{ className: "active" }}
                    activeOptions={{ exact: true }}
                  >
                    <I className="h-4 w-4" /> {label as string}
                  </Link>
                );
              })}
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
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8">
              <p className="eyebrow">Dashboard</p>
              <h2 className="mt-2 font-display text-2xl text-[color:var(--coffee)]">
                Selamat datang di Cuma Biji
              </h2>
              <p className="mt-3 max-w-xl text-sm text-[color:var(--muted-foreground)]">
                Fondasi akun kamu sudah aktif. Belanja, riwayat pesanan, dan halaman lainnya akan tersedia
                di tahap berikutnya.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["0", "Pesanan aktif"],
                  ["0", "Wishlist"],
                  ["0", "Poin loyalti"],
                ].map(([num, label]) => (
                  <div key={label} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-5">
                    <p className="font-display text-3xl text-[color:var(--coffee)]">{num}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
