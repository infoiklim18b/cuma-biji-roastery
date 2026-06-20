import type { ReactNode } from "react";
import { BeanMark } from "./BeanMark";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--card)] px-6 py-16 text-center">
      <BeanMark className="h-10 w-10 opacity-60" aria-hidden />
      <h3 className="mt-4 font-display text-xl text-[color:var(--coffee)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[color:var(--muted-foreground)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
