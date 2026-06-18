import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/cuma/Logo";
import { BeanSilhouette } from "@/components/cuma/BeanMark";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Masuk atau daftar — Cuma Biji" }] }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/akun" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Selamat datang kembali!");
        navigate({ to: "/akun" });
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Cek emailmu untuk verifikasi.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        toast.success("Tautan reset sudah dikirim ke emailmu.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Gagal masuk dengan Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/akun" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--background)]">
      <BeanSilhouette className="pointer-events-none absolute -top-20 -left-20 h-[420px] w-[420px]" aria-hidden />
      <BeanSilhouette className="pointer-events-none absolute -bottom-32 -right-20 h-[520px] w-[520px]" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Logo className="mb-12" />

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 shadow-sm">
          <p className="eyebrow">{mode === "register" ? "Daftar baru" : mode === "forgot" ? "Lupa password" : "Selamat datang"}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[color:var(--coffee)]">
            {mode === "login" ? "Masuk ke akunmu" : mode === "register" ? "Buat akun Cuma Biji" : "Reset password"}
          </h1>

          {mode !== "forgot" && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-medium hover:bg-[color:var(--secondary)] disabled:opacity-60"
            >
              <GoogleIcon /> Lanjut dengan Google
            </button>
          )}

          {mode !== "forgot" && (
            <div className="my-6 flex items-center gap-3 text-xs text-[color:var(--muted-foreground)]">
              <div className="h-px flex-1 bg-[color:var(--border)]" />
              atau
              <div className="h-px flex-1 bg-[color:var(--border)]" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Nama lengkap">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Mira Hanindita"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="kamu@email.com"
              />
            </Field>
            {mode !== "forgot" && (
              <Field label="Password">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Minimal 6 karakter"
                />
              </Field>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[color:var(--coffee)] py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Memproses…" : mode === "login" ? "Masuk" : mode === "register" ? "Daftar" : "Kirim tautan reset"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === "login" && (
              <>
                <button type="button" onClick={() => setMode("forgot")} className="text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)]">
                  Lupa password?
                </button>
                <p className="text-[color:var(--muted-foreground)]">
                  Belum punya akun?{" "}
                  <button type="button" onClick={() => setMode("register")} className="font-medium text-[color:var(--coffee)] underline">
                    Daftar
                  </button>
                </p>
              </>
            )}
            {mode === "register" && (
              <p className="text-[color:var(--muted-foreground)]">
                Sudah punya akun?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-medium text-[color:var(--coffee)] underline">
                  Masuk
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button type="button" onClick={() => setMode("login")} className="text-[color:var(--coffee)] underline">
                Kembali ke login
              </button>
            )}
          </div>
        </div>

        <Link to="/" className="mt-8 text-center text-xs text-[color:var(--muted-foreground)] hover:text-[color:var(--coffee)]">
          ← Kembali ke beranda
        </Link>
      </div>

      <style>{`
        .input-field {
          display: block;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--ink);
          outline: none;
        }
        .input-field:focus { border-color: var(--sage-deep); box-shadow: 0 0 0 3px color-mix(in oklab, var(--sage) 30%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[color:var(--ink)]">{label}</span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.32A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.04l3.02-2.32z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.96l3.02 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}
