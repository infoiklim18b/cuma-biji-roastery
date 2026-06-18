import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/cuma/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Cuma Biji" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password berhasil diubah");
    navigate({ to: "/akun" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Logo className="mb-10" />
      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 shadow-sm">
        <p className="eyebrow">Reset password</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--coffee)]">Buat password baru</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Password baru</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Konfirmasi password</span>
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="block w-full rounded-md border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2.5 text-sm" />
          </label>
          <button type="submit" disabled={loading}
            className="w-full rounded-full bg-[color:var(--coffee)] py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-60">
            {loading ? "Menyimpan…" : "Simpan password"}
          </button>
        </form>
      </div>
    </div>
  );
}
