import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--border)]">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="grid h-8 w-8 place-items-center rounded-l-full hover:bg-[color:var(--secondary)] disabled:opacity-30"
        aria-label="Kurangi"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-8 px-2 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max ?? 99, value + 1))}
        disabled={max != null && value >= max}
        className="grid h-8 w-8 place-items-center rounded-r-full hover:bg-[color:var(--secondary)] disabled:opacity-30"
        aria-label="Tambah"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
