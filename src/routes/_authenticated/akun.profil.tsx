import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/queries";

const schema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .refine((v) => !v || /^[0-9+\-\s]{6,20}$/.test(v), "Nomor HP tidak valid"),
});

export const Route = createFileRoute("/_authenticated/akun/profil")({
  head: () => ({ meta: [{ title: "Profil — Cuma Biji" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [userId, setUserId] = useState<string>("");
  const qc = useQueryClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: !!userId });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ full_name: name, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.full_name, phone: parsed.data.phone ?? null })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      toast.error("Gagal menyimpan");
      return;
    }
    toast.success("Profil tersimpan");
    qc.invalidateQueries({ queryKey: ["profile", userId] });
  }

  return (
    <AccountLayout title="Profil">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 md:p-8"
      >
        <Field label="Nama lengkap">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Nomor HP / WhatsApp">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0812-3456-7890"
            className="input"
          />
        </Field>
        <button
          type="submit"
          disabled={loading || !userId}
          className="rounded-full bg-[color:var(--coffee)] px-6 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Menyimpan…" : "Simpan perubahan"}
        </button>
      </form>
      <style>{`.input{display:block;width:100%;border-radius:.5rem;border:1px solid var(--border);background:var(--background);padding:.625rem 1rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--sage-deep)}`}</style>
    </AccountLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </label>
  );
}
