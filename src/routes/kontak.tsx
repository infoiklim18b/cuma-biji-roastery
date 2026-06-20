import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Email tidak valid").max(255),
  message: z.string().trim().min(10, "Pesan terlalu pendek").max(1000),
});

export const Route = createFileRoute("/kontak")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Kontak — Cuma Biji" },
      { name: "description", content: "Hubungi tim Cuma Biji. Kami senang mendengar darimu." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("activity_logs").insert({
      action: "contact_message",
      entity: "contact",
      user_id: userData.user?.id ?? null,
      meta: { name: parsed.data.name, email: parsed.data.email, message: parsed.data.message },
    });
    setLoading(false);
    if (error) {
      toast.error("Gagal mengirim pesan. Coba lagi.");
      return;
    }
    toast.success("Pesan terkirim. Kami akan balas via email.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Kontak"
        title="Sapa kami."
        description="Pertanyaan, kerja sama, atau sekadar ingin diskusi soal kopi — kami senang mendengar darimu."
      />

      <section className="container-editorial grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5 space-y-8">
          <InfoRow Icon={Mail} title="Email" value="halo@cumabiji.id" />
          <InfoRow Icon={Phone} title="WhatsApp" value="+62 812-3456-7890" />
          <InfoRow Icon={MapPin} title="Roastery" value="Jl. Cikajang No. 12, Bandung" />
          <div>
            <p className="eyebrow">Jam operasional</p>
            <p className="mt-2 text-sm">Senin – Jumat · 09.00 – 18.00 WIB</p>
            <p className="text-sm text-[color:var(--muted-foreground)]">Balasan biasanya dalam 1 hari kerja.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 md:p-8">
          <Field label="Nama">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
              className="block w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--sage-deep)]"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              maxLength={255}
              className="block w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--sage-deep)]"
            />
          </Field>
          <Field label="Pesan">
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={1000}
              rows={6}
              className="block w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--sage-deep)]"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[color:var(--coffee)] px-6 py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Mengirim…" : "Kirim pesan"}
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({ Icon, title, value }: { Icon: typeof Mail; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--cream)]">
        <Icon className="h-4 w-4 text-[color:var(--coffee)]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-[color:var(--muted-foreground)]">{title}</p>
        <p className="mt-1 text-sm text-[color:var(--coffee)]">{value}</p>
      </div>
    </div>
  );
}
