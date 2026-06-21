import { Check, Clock, Package, Truck, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["order_status"];

const STEPS: { v: Status; l: string; icon: typeof Check }[] = [
  { v: "menunggu_pembayaran", l: "Menunggu pembayaran", icon: Clock },
  { v: "menunggu_verifikasi", l: "Verifikasi pembayaran", icon: Clock },
  { v: "diproses", l: "Diproses & disangrai", icon: Package },
  { v: "dikirim", l: "Dikirim", icon: Truck },
  { v: "selesai", l: "Selesai", icon: Check },
];

export function OrderStatusTimeline({ status }: { status: Status }) {
  if (status === "dibatalkan" || status === "refund") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--cream)] p-4 text-sm">
        <XCircle className="h-4 w-4 text-[color:var(--destructive)]" />
        {status === "dibatalkan" ? "Pesanan dibatalkan" : "Pesanan direfund"}
      </div>
    );
  }
  const idx = STEPS.findIndex((s) => s.v === status);
  return (
    <ol className="grid gap-0">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s.v} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full ${
                  done || active
                    ? "bg-[color:var(--coffee)] text-[color:var(--cream)]"
                    : "border border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={`my-1 h-8 w-px ${done ? "bg-[color:var(--coffee)]" : "bg-[color:var(--border)]"}`}
                />
              )}
            </div>
            <div className="pb-6 pt-1">
              <p
                className={`text-sm ${
                  active ? "font-medium text-[color:var(--coffee)]" : "text-[color:var(--ink)]"
                }`}
              >
                {s.l}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
