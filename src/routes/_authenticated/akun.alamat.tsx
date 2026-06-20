import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { AccountLayout } from "@/components/cuma/AccountLayout";
import { EmptyState } from "@/components/cuma/EmptyState";
import { addressesQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  label: z.string().trim().min(1).max(40),
  recipient: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(20),
  street: z.string().trim().min(5).max(255),
  city: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  postal_code: z.string().trim().min(4).max(10),
  is_default: z.boolean().optional(),
});

export const Route = createFileRoute("/_authenticated/akun/alamat")({
  head: () => ({ meta: [{ title: "Alamat — Cuma Biji" }] }),
  component: AddressesPage,
});

type Addr = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
};

function AddressesPage() {
  const [userId, setUserId] = useState("");
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Addr | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
  }, []);

  const { data: addresses } = useQuery({ ...addressesQuery(userId), enabled: !!userId });
  const list = (addresses ?? []) as Addr[];

  async function handleDelete(id: string) {
    if (!confirm("Hapus alamat ini?")) return;
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus");
      return;
    }
    toast.success("Alamat dihapus");
    qc.invalidateQueries({ queryKey: ["addresses", userId] });
  }

  async function handleSetDefault(id: string) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    toast.success("Alamat utama diperbarui");
    qc.invalidateQueries({ queryKey: ["addresses", userId] });
  }

  return (
    <AccountLayout title="Buku alamat">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {list.length} alamat tersimpan
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--coffee)] px-5 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah alamat
        </button>
      </div>

      {showForm && (
        <AddressForm
          userId={userId}
          initial={editing}
          onCancel={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["addresses", userId] });
          }}
        />
      )}

      {list.length === 0 && !showForm ? (
        <EmptyState
          title="Belum ada alamat"
          description="Tambah alamat untuk mempermudah proses checkout nanti."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <article key={a.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg text-[color:var(--coffee)]">{a.label}</p>
                  {a.is_default && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[color:var(--cream)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--coffee)]">
                      <Star className="h-3 w-3" /> Utama
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => {
                      setEditing(a);
                      setShowForm(true);
                    }}
                    className="rounded-full p-2 hover:bg-[color:var(--secondary)]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Hapus"
                    onClick={() => handleDelete(a.id)}
                    className="rounded-full p-2 text-[color:var(--destructive)] hover:bg-[color:var(--secondary)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium">{a.recipient}</p>
              <p className="text-sm text-[color:var(--muted-foreground)]">{a.phone}</p>
              <p className="mt-2 text-sm">{a.street}</p>
              <p className="text-sm">
                {a.city}, {a.province} {a.postal_code}
              </p>
              {!a.is_default && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(a.id)}
                  className="mt-3 text-xs text-[color:var(--coffee)] underline"
                >
                  Jadikan alamat utama
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}

function AddressForm({
  userId,
  initial,
  onCancel,
  onSaved,
}: {
  userId: string;
  initial: Addr | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    label: initial?.label ?? "Rumah",
    recipient: initial?.recipient ?? "",
    phone: initial?.phone ?? "",
    street: initial?.street ?? "",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    postal_code: initial?.postal_code ?? "",
    is_default: initial?.is_default ?? false,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    if (parsed.data.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    }
    const payload = { ...parsed.data, user_id: userId };
    const { error } = initial
      ? await supabase.from("addresses").update(payload).eq("id", initial.id)
      : await supabase.from("addresses").insert(payload);
    setLoading(false);
    if (error) {
      toast.error("Gagal menyimpan alamat");
      return;
    }
    toast.success("Alamat tersimpan");
    onSaved();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 sm:grid-cols-2"
    >
      <F label="Label">
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="i" />
      </F>
      <F label="Penerima">
        <input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} className="i" />
      </F>
      <F label="Nomor HP">
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="i" />
      </F>
      <F label="Kode Pos">
        <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="i" />
      </F>
      <div className="sm:col-span-2">
        <F label="Alamat lengkap">
          <textarea
            rows={2}
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="i"
          />
        </F>
      </div>
      <F label="Kota / Kabupaten">
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="i" />
      </F>
      <F label="Provinsi">
        <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="i" />
      </F>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
        />
        Jadikan alamat utama
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[color:var(--coffee)] px-5 py-2.5 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Menyimpan…" : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[color:var(--border)] px-5 py-2.5 text-sm hover:bg-[color:var(--secondary)]"
        >
          Batal
        </button>
      </div>
      <style>{`.i{display:block;width:100%;border-radius:.5rem;border:1px solid var(--border);background:var(--background);padding:.5rem .875rem;font-size:.875rem;outline:none}.i:focus{border-color:var(--sage-deep)}`}</style>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
        {label}
      </span>
      {children}
    </label>
  );
}
