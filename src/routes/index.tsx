import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { BeanSilhouette } from "@/components/cuma/BeanMark";
import heroImg from "@/assets/hero-coffee.jpg";
import beansCluster from "@/assets/beans-cluster.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cuma Biji — Specialty Coffee Nusantara" },
      { name: "description", content: "Single origin Gayo, Toraja, Kintamani, Java, Flores, Papua. Disangrai segar, dikirim langsung." },
      { property: "og:title", content: "Cuma Biji — Specialty Coffee Nusantara" },
      { property: "og:description", content: "Specialty coffee dari kebun-kebun terbaik Indonesia." },
    ],
  }),
  component: Home,
});

const origins = [
  { slug: "gayo", name: "Gayo", region: "Aceh" },
  { slug: "toraja", name: "Toraja", region: "Sulawesi" },
  { slug: "kintamani", name: "Kintamani", region: "Bali" },
  { slug: "java-preanger", name: "Java Preanger", region: "Jawa Barat" },
  { slug: "flores-bajawa", name: "Flores Bajawa", region: "NTT" },
  { slug: "papua", name: "Papua Wamena", region: "Papua" },
] as const;

function Home() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <BeanSilhouette className="pointer-events-none absolute -top-12 -right-24 h-[420px] w-[420px]" aria-hidden />
        <div className="container-editorial grid gap-12 pt-20 pb-24 md:grid-cols-12 md:gap-10 md:pt-28 md:pb-32">
          <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-center">
            <p className="eyebrow">Edisi · Nusantara 2026</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-[color:var(--coffee)] md:text-6xl lg:text-7xl">
              Biji terbaik,<br />dari tanah sendiri.
            </h1>
            <p className="mt-6 max-w-md text-base text-[color:var(--muted-foreground)]">
              Specialty coffee dari enam dataran tinggi Indonesia. Disangrai tangan setiap minggu, dikirim segar ke pintu rumahmu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-6 py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 transition"
              >
                Belanja kopi <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/custom"
                className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-6 py-3 text-sm font-medium hover:bg-[color:var(--secondary)] transition"
              >
                Racik sendiri
              </Link>
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[color:var(--cream)]">
              <img
                src={heroImg}
                alt="Biji kopi segar disendok ke kantong linen"
                width={1600}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ORIGIN STRIP */}
      <section className="border-y border-[color:var(--border)] bg-[color:var(--cream)]">
        <div className="container-editorial py-10">
          <p className="eyebrow mb-6">Origin Nusantara</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
            {origins.map((o) => (
              <Link
                key={o.slug}
                to="/single-origin"
                className="group flex flex-col border-l border-[color:var(--border)] pl-4 hover:border-[color:var(--coffee)] transition"
              >
                <span className="font-display text-lg text-[color:var(--coffee)] group-hover:underline">{o.name}</span>
                <span className="text-xs text-[color:var(--muted-foreground)]">{o.region}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="container-editorial py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow">Cara kerja kami</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-[color:var(--coffee)] md:text-5xl">
              Dari petani, ke sangrai, ke cangkirmu.
            </h2>
          </div>
          <div className="md:col-span-7 grid gap-8 sm:grid-cols-2">
            {[
              ["01", "Sourcing langsung", "Kerja sama langsung dengan petani di enam dataran tinggi Indonesia."],
              ["02", "Sangrai mingguan", "Roasting fresh setiap Senin. Tidak ada stok lama."],
              ["03", "Cupping berkala", "Setiap batch dicicipi sebelum dikirim. Skor minimum 84."],
              ["04", "Kirim cepat", "Bekerja dengan JNE, J&T, SiCepat, AnterAja. Dikemas valve fresh."],
            ].map(([n, title, desc]) => (
              <div key={n} className="border-t border-[color:var(--border)] pt-5">
                <p className="font-display text-sm text-[color:var(--sage-deep)]">{n}</p>
                <p className="mt-2 font-display text-xl text-[color:var(--coffee)]">{title}</p>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALLOUT */}
      <section className="bg-[color:var(--coffee)] text-[color:var(--cream)]">
        <div className="container-editorial grid gap-10 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7">
            <p className="eyebrow text-[color:var(--beige)]">Custom Coffee Builder</p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Racik kopi sesuai seleramu — origin, sangrai, gilingan.
            </h2>
            <p className="mt-5 max-w-xl text-[color:var(--beige)]">
              Pilih dari enam origin, empat level sangrai, dan tujuh ukuran giling.
              Kami sangrai dan giling on-demand setelah pesananmu masuk.
            </p>
            <Link
              to="/custom"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--cream)] px-6 py-3 text-sm font-medium text-[color:var(--coffee)] hover:opacity-90"
            >
              Mulai racik <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:col-span-5 flex items-center justify-center">
            <img src={beansCluster} alt="" width={400} height={400} className="w-64 md:w-80" loading="lazy" />
          </div>
        </div>
      </section>

      {/* JOURNAL TEASER */}
      <section className="container-editorial py-24 md:py-32">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow">Jurnal</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[color:var(--coffee)] md:text-5xl">Cerita & panduan</h2>
          </div>
          <Link to="/blog" className="hidden md:inline text-sm hover:text-[color:var(--coffee)]">Lihat semua →</Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            ["/blog/cara-seduh-v60", "Panduan Seduh", "Cara Seduh V60 untuk Pemula"],
            ["/blog/mengenal-kopi-gayo", "Mengenal Origin", "Mengenal Kopi Gayo, Permata Aceh"],
            ["/blog/memilih-roast-level", "Roasting Guide", "Memilih Roast Level yang Pas"],
          ].map(([href, cat, title]) => (
            <Link key={href} to={href} className="group">
              <div className="aspect-[4/3] rounded-xl bg-[color:var(--cream)] mb-4" />
              <p className="eyebrow">{cat}</p>
              <p className="mt-2 font-display text-xl text-[color:var(--coffee)] group-hover:underline">{title}</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
