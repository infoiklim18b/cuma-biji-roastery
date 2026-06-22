import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, wishlistQuery } from "@/lib/queries";
import { isAdminQuery, bootstrapFirstAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/akun")({
  head: () => ({ meta: [{ title: "Akun saya — Cuma Biji" }] }),
  component: AccountDashboard,
});

function AccountDashboard() {
  const qc = useQueryClient();
  const [userId, setUserId] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: !!userId });
  const { data: wishlist } = useQuery({ ...wishlistQuery(userId), enabled: !!userId });
  const { data: isAdmin } = useQuery({ ...isAdminQuery(userId), enabled: !!userId });

  async function becomeAdmin() {
    try {
      await bootstrapFirstAdmin();
      toast.success("Selamat, kamu kini admin pertama ☕");
      qc.invalidateQueries({ queryKey: ["is-admin"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AccountLayout title="Dashboard">
      {!isAdmin && (
        <div className="rounded-2xl border border-dashed border-[color:var(--coffee)]/40 bg-[color:var(--secondary)]/30 p-4 mb-4 flex items-center justify-between gap-4">
          <p className="text-xs text-[color:var(--muted-foreground)]">
            Belum ada admin? Klaim akses admin pertama untuk mengelola toko.
          </p>
          <Button size="sm" variant="outline" onClick={becomeAdmin}>
            <Shield className="h-3.5 w-3.5 mr-1" /> Jadi admin pertama
          </Button>
        </div>
      )}
      {isAdmin && (
        <div className="rounded-2xl border border-[color:var(--coffee)] bg-[color:var(--secondary)]/40 p-4 mb-4 flex items-center justify-between gap-4">
          <p className="text-xs text-[color:var(--coffee)]"><Shield className="h-3.5 w-3.5 inline mr-1" /> Kamu admin Cuma Biji</p>
          <Link to="/admin" className="text-xs underline text-[color:var(--coffee)]">Buka admin panel →</Link>
        </div>
      )}
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
