import { Star } from "lucide-react";

export function RatingStars({ value, size = 14 }: { value: number; size?: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating ${v} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i <= Math.round(v)
              ? "fill-[color:var(--coffee)] text-[color:var(--coffee)]"
              : "text-[color:var(--border)]"
          }
        />
      ))}
    </div>
  );
}

export function Meter({ label, value }: { label: string; value: number | null }) {
  const v = Math.max(0, Math.min(5, value ?? 0));
  return (
    <div>
      <div className="flex justify-between text-xs text-[color:var(--muted-foreground)]">
        <span>{label}</span>
        <span>{v}/5</span>
      </div>
      <div className="mt-1.5 h-1 w-full rounded-full bg-[color:var(--border)]">
        <div
          className="h-full rounded-full bg-[color:var(--coffee)]"
          style={{ width: `${(v / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
