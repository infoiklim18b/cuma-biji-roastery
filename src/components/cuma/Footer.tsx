import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[color:var(--border)] bg-[color:var(--cream)]">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Logo />
          <p className="text-sm text-[color:var(--muted-foreground)] max-w-xs">
            Specialty coffee Nusantara. Disangrai dengan tangan, dikirim segar dari Indonesia.
          </p>
        </div>
        <FooterCol title="Jelajah" items={[["/shop","Semua kopi"],["/single-origin","Single Origin"],["/blend","Blend"],["/custom","Custom Coffee"],["/accessories","Aksesoris"]]} />
        <FooterCol title="Cerita" items={[["/blog","Jurnal"],["/tentang","Tentang kami"],["/komunitas","Komunitas"],["/kontak","Kontak"]]} />
        <FooterCol title="Bantuan" items={[["/akun","Akun saya"],["/akun/pesanan","Lacak pesanan"],["/kebijakan-privasi","Kebijakan privasi"],["/syarat","Syarat & ketentuan"]]} />
      </div>
      <div className="border-t border-[color:var(--border)]">
        <div className="container-editorial flex flex-col md:flex-row items-start md:items-center justify-between gap-3 py-6 text-xs text-[color:var(--muted-foreground)]">
          <span>© {new Date().getFullYear()} Cuma Biji. Dibuat dengan biji terbaik. Ini biji yang paling biji.</span>
          <span>Jakarta · Bandung · Bali</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div className="md:col-span-2 lg:col-span-2 space-y-3">
      <p className="eyebrow">{title}</p>
      <ul className="space-y-2 text-sm">
        {items.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-[color:var(--ink)] hover:text-[color:var(--coffee)] transition-colors">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
