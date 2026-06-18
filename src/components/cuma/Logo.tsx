import { Link } from "@tanstack/react-router";
import { BeanMark } from "./BeanMark";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Cuma Biji — beranda">
      <BeanMark className="h-7 w-7" />
      <span className="font-display text-xl font-semibold tracking-tight text-[color:var(--coffee)]">
        Cuma Biji
      </span>
    </Link>
  );
}
