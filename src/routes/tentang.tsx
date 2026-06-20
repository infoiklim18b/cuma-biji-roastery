import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import farmerImg from "@/assets/about-farmer.jpg";
import roasteryImg from "@/assets/about-roastery.jpg";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Cuma Biji — Specialty Coffee Nusantara" },
      { name: "description", content: "Cerita kami, cara kerja kami, dan dari mana asal kopi yang kami sangrai." },
      { property: "og:title", content: "Tentang Cuma Biji" },
      { property: "og:description", content: "Direct trade, sangrai mingguan, kopi single origin Nusantara." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Tentang"
        title="Cuma Biji — kopi specialty dari tanah sendiri."
        description="Kami merawat hubungan dengan petani, sangrai segar setiap minggu, dan mengirimnya langsung ke cangkirmu."
      />

      {/* MANIFESTO */}
      <section className="container-editorial grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <p className="eyebrow">Manifesto</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[color:var(--coffee)] md:text-4xl">
            Kopi yang jujur, dari petani sampai cangkir.
          </h2>
        </div>
        <div className="md:col-span-7 space-y-4 text-[color:var(--ink)]">
          <p>
            Cuma Biji lahir dari satu keyakinan sederhana: kopi terbaik Indonesia layak dinikmati sebagai
            specialty coffee, dan petani yang menanamnya layak diperlakukan dengan adil.
          </p>
          <p>
            Kami bekerja langsung dengan kelompok tani di enam dataran tinggi — Gayo, Toraja, Kintamani,
            Java Preanger, Flores Bajawa, dan Papua Wamena — memilih lot berkualitas, lalu menyangrainya
            di roastery kecil kami setiap Senin.
          </p>
          <p>
            Setiap batch dicicipi sebelum dikirim. Skor minimum 84. Tidak ada stok lama.
          </p>
        </div>
      </section>

      {/* IMAGES */}
      <section className="container-editorial grid gap-6 pb-16 md:grid-cols-2">
        <figure className="aspect-[4/3] overflow-hidden rounded-2xl bg-[color:var(--cream)]">
          <img src={farmerImg} alt="Tangan petani memilih ceri kopi merah" className="h-full w-full object-cover" loading="lazy" />
        </figure>
        <figure className="aspect-[4/3] overflow-hidden rounded-2xl bg-[color:var(--cream)]">
          <img src={roasteryImg} alt="Mesin sangrai dengan biji kopi keluar" className="h-full w-full object-cover" loading="lazy" />
        </figure>
      </section>

      {/* VALUES */}
      <section className="bg-[color:var(--cream)]">
        <div className="container-editorial py-20">
          <p className="eyebrow">Nilai kami</p>
          <h2 className="mt-3 font-display text-3xl text-[color:var(--coffee)] md:text-4xl">Empat hal yang tidak kami kompromi.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Direct trade", "Harga adil bagi petani, telusur asal lot."],
              ["Fresh roast", "Sangrai setiap Senin, kirim dalam 7 hari."],
              ["Quality cupping", "Setiap batch dicicipi, skor minimum 84."],
              ["Kemasan valve", "Kantong valve menjaga aroma sampai diseduh."],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-[color:var(--border)] pt-5">
                <p className="font-display text-xl text-[color:var(--coffee)]">{t}</p>
                <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-editorial py-20 text-center">
        <p className="eyebrow">Mulai</p>
        <h2 className="mt-3 font-display text-3xl text-[color:var(--coffee)] md:text-5xl">
          Coba satu kantong, rasakan bedanya.
        </h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/shop" className="rounded-full bg-[color:var(--coffee)] px-6 py-3 text-sm font-medium text-[color:var(--primary-foreground)]">
            Lihat katalog
          </Link>
          <Link to="/custom" className="rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-medium">
            Racik sendiri
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
