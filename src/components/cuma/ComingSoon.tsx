import { Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { BeanSilhouette } from "@/components/cuma/BeanMark";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <BeanSilhouette className="pointer-events-none absolute -top-16 -right-16 h-[380px] w-[380px]" aria-hidden />
        <div className="container-editorial py-24 md:py-32">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-[color:var(--coffee)] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-[color:var(--muted-foreground)]">{description}</p>
          <p className="mt-10 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--cream)] px-4 py-2 text-xs eyebrow">
            Segera hadir · Tahap berikutnya
          </p>
          <div className="mt-8">
            <Link to="/" className="text-sm underline hover:text-[color:var(--coffee)]">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
