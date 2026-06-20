import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, wishlistQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({ meta: [{ title: "Akun saya — Cuma Biji" }] }),
  component: AccountDashboard,
});

function AccountDashboard() {
  const [userId, setUserId] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: !!userId });
  const { data: wishlist } = useQuery({ ...wishlistQuery(userId), enabled: !!userId });

  return (
    <AccountLayout title="Dashboard">
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8">
        <p className="eyebrow">Selamat datang</p>
        <h2 className="mt-2 font-display text-2xl text-[color:var(--coffee)]">
          {profile?.full_name ? `Halo, ${profile.full_name.split(" ")[0]}!` : "Halo!"}
        </h2>
        <p className="mt-3 max-w-xl text-sm text-[color:var(--muted-foreground)]">
          Pantau pesanan, simpan kopi favorit, dan kelola alamatmu dari satu tempat.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat num="0" label="Pesanan aktif" />
          <Stat num={String(wishlist?.length ?? 0)} label="Wishlist" />
          <Stat num="0" label="Poin loyalti" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ShortcutCard
          to="/akun/profil"
          title="Lengkapi profil"
          desc="Tambah nomor HP untuk update pesanan via WhatsApp."
        />
        <ShortcutCard
          to="/akun/alamat"
          title="Simpan alamat"
          desc="Hemat waktu saat checkout dengan alamat tersimpan."
        />
        <ShortcutCard
          to="/shop"
          title="Mulai belanja"
          desc="Jelajah katalog single origin, blend, dan aksesoris."
        />
        <ShortcutCard
          to="/custom"
          title="Racik kopi sendiri"
          desc="Custom origin, roast, berat, dan grind sesuai seleramu."
        />
      </div>
    </AccountLayout>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-5">
      <p className="font-display text-3xl text-[color:var(--coffee)]">{num}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</p>
    </div>
  );
}

function ShortcutCard({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 transition-colors hover:border-[color:var(--coffee)]"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-[color:var(--coffee)]">{title}</p>
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{desc}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-[color:var(--muted-foreground)] transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
