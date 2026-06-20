import type { ReactNode } from "react";
import { BeanSilhouette } from "./BeanMark";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--cream)]">
      <BeanSilhouette
        className="pointer-events-none absolute -right-20 -top-16 h-[360px] w-[360px]"
        aria-hidden
      />
      <div className="container-editorial py-16 md:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-[color:var(--coffee)] md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-[color:var(--muted-foreground)]">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
