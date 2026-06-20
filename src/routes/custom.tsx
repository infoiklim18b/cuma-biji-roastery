import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useReducer } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { originsQuery } from "@/lib/queries";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/custom")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Custom Coffee Builder — Cuma Biji" },
      { name: "description", content: "Racik kopimu — pilih origin, roast level, berat, dan grind size." },
    ],
  }),
  component: CustomBuilder,
});

const ROAST = [
  { v: "light", l: "Light", desc: "Bright, fruity, asam jelas" },
  { v: "medium", l: "Medium", desc: "Balanced, manis karamel" },
  { v: "medium_dark", l: "Medium Dark", desc: "Body penuh, cokelat" },
  { v: "dark", l: "Dark", desc: "Bold, smoky, low acidity" },
];

const WEIGHT = [
  { v: 100, l: "100 gr", base: 65000 },
  { v: 250, l: "250 gr", base: 145000 },
  { v: 500, l: "500 gr", base: 275000 },
  { v: 1000, l: "1 kg", base: 520000 },
];

const GRIND = [
  { v: "whole_bean", l: "Whole Bean" },
  { v: "espresso", l: "Espresso" },
  { v: "v60", l: "V60" },
  { v: "kalita", l: "Kalita" },
  { v: "moka_pot", l: "Moka Pot" },
  { v: "french_press", l: "French Press" },
  { v: "tubruk", l: "Tubruk" },
];

type State = { step: number; origin?: string; roast?: string; weight?: number; grind?: string };
type Action =
  | { type: "set"; key: keyof State; value: State[keyof State] }
  | { type: "next" }
  | { type: "back" }
  | { type: "go"; step: number };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "set":
      return { ...s, [a.key]: a.value };
    case "next":
      return { ...s, step: Math.min(4, s.step + 1) };
    case "back":
      return { ...s, step: Math.max(1, s.step - 1) };
    case "go":
      return { ...s, step: a.step };
  }
}

function CustomBuilder() {
  const [state, dispatch] = useReducer(reducer, { step: 1 });
  const { data: origins } = useQuery(originsQuery());

  const weight = WEIGHT.find((w) => w.v === state.weight);
  const price = weight?.base ?? 0;

  function next() {
    if (state.step === 1 && !state.origin) return toast.error("Pilih origin dulu.");
    if (state.step === 2 && !state.roast) return toast.error("Pilih roast level.");
    if (state.step === 3 && !state.weight) return toast.error("Pilih berat kopi.");
    if (state.step === 4 && !state.grind) return toast.error("Pilih ukuran gilingan.");
    dispatch({ type: "next" });
  }

  function addToCart() {
    if (!state.origin || !state.roast || !state.weight || !state.grind) {
      toast.error("Lengkapi semua langkah terlebih dulu.");
      return;
    }
    toast.info("Keranjang aktif di tahap berikutnya — racikanmu akan kembali tersedia.");
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Custom Coffee Builder"
        title="Racik kopi sesuai seleramu."
        description="Empat langkah — pilih origin, sangrai, berat, dan gilingan. Kami sangrai dan giling setelah pesananmu masuk."
      />

      <section className="container-editorial grid gap-12 py-12 md:grid-cols-12 md:py-16">
        {/* WIZARD */}
        <div className="md:col-span-8">
          <Stepper current={state.step} onJump={(s) => dispatch({ type: "go", step: s })} />

          <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 md:p-10">
            {state.step === 1 && (
              <StepBlock title="Pilih origin" subtitle="Setiap origin punya karakter berbeda.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {origins?.map((o) => (
                    <ChoiceCard
                      key={o.slug}
                      active={state.origin === o.slug}
                      onClick={() => dispatch({ type: "set", key: "origin", value: o.slug })}
                      title={o.name}
                      subtitle={o.region}
                      hint={o.description ?? undefined}
                    />
                  ))}
                </div>
              </StepBlock>
            )}

            {state.step === 2 && (
              <StepBlock title="Roast level" subtitle="Tingkat sangrai memengaruhi rasa.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROAST.map((r) => (
                    <ChoiceCard
                      key={r.v}
                      active={state.roast === r.v}
                      onClick={() => dispatch({ type: "set", key: "roast", value: r.v })}
                      title={r.l}
                      hint={r.desc}
                    />
                  ))}
                </div>
              </StepBlock>
            )}

            {state.step === 3 && (
              <StepBlock title="Berat" subtitle="Pilih ukuran kemasan.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {WEIGHT.map((w) => (
                    <ChoiceCard
                      key={w.v}
                      active={state.weight === w.v}
                      onClick={() => dispatch({ type: "set", key: "weight", value: w.v })}
                      title={w.l}
                      subtitle={formatIDR(w.base)}
                    />
                  ))}
                </div>
              </StepBlock>
            )}

            {state.step === 4 && (
              <StepBlock title="Grind size" subtitle="Sesuaikan dengan metode seduhmu.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {GRIND.map((g) => (
                    <ChoiceCard
                      key={g.v}
                      active={state.grind === g.v}
                      onClick={() => dispatch({ type: "set", key: "grind", value: g.v })}
                      title={g.l}
                    />
                  ))}
                </div>
              </StepBlock>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-[color:var(--border)] pt-6">
              <button
                type="button"
                onClick={() => dispatch({ type: "back" })}
                disabled={state.step === 1}
                className="inline-flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
              {state.step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-6 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90"
                >
                  Lanjut <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={addToCart}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-6 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90"
                >
                  Tambah ke keranjang
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <aside className="md:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-6">
            <p className="eyebrow">Racikanmu</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Pair k="Origin" v={origins?.find((o) => o.slug === state.origin)?.name} />
              <Pair k="Roast" v={ROAST.find((r) => r.v === state.roast)?.l} />
              <Pair k="Berat" v={WEIGHT.find((w) => w.v === state.weight)?.l} />
              <Pair k="Grind" v={GRIND.find((g) => g.v === state.grind)?.l} />
            </dl>
            <div className="mt-6 border-t border-[color:var(--border)] pt-4">
              <p className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
                Estimasi harga
              </p>
              <p className="mt-1 font-display text-3xl text-[color:var(--coffee)]">
                {formatIDR(price)}
              </p>
            </div>
            <p className="mt-4 text-xs text-[color:var(--muted-foreground)]">
              Sangrai &amp; giling on-demand setelah pesanan masuk. Pengiriman 2–3 hari kerja setelah
              proses selesai.
            </p>
            <Link
              to="/single-origin"
              className="mt-4 block text-xs text-[color:var(--coffee)] underline"
            >
              Pelajari karakter tiap origin →
            </Link>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}

function Stepper({
  current,
  onJump,
}: {
  current: number;
  onJump: (s: number) => void;
}) {
  const steps = ["Origin", "Roast", "Berat", "Grind"];
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = current === n;
        const done = current > n;
        return (
          <li key={s}>
            <button
              type="button"
              onClick={() => onJump(n)}
              className="w-full text-left"
            >
              <div
                className={`h-1 rounded-full ${
                  done || active
                    ? "bg-[color:var(--coffee)]"
                    : "bg-[color:var(--border)]"
                }`}
              />
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    done
                      ? "bg-[color:var(--coffee)] text-[color:var(--cream)]"
                      : active
                      ? "border border-[color:var(--coffee)] text-[color:var(--coffee)]"
                      : "border border-[color:var(--border)] text-[color:var(--muted-foreground)]"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : n}
                </span>
                <span className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">
                  {s}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-[color:var(--coffee)]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ChoiceCard({
  active,
  onClick,
  title,
  subtitle,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
        active
          ? "border-[color:var(--coffee)] bg-[color:var(--cream)]"
          : "border-[color:var(--border)] bg-[color:var(--background)] hover:border-[color:var(--coffee)]"
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <span className="font-display text-lg text-[color:var(--coffee)]">{title}</span>
        {active && <Check className="h-4 w-4 text-[color:var(--coffee)]" />}
      </div>
      {subtitle && (
        <span className="text-xs text-[color:var(--muted-foreground)]">{subtitle}</span>
      )}
      {hint && <span className="text-xs text-[color:var(--muted-foreground)]">{hint}</span>}
    </button>
  );
}

function Pair({ k, v }: { k: string; v?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--border)] pb-2 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{k}</dt>
      <dd className="text-right text-sm font-medium text-[color:var(--coffee)]">{v ?? "—"}</dd>
    </div>
  );
}
