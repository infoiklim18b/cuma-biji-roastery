import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronRight, MapPin, Plus, Tag, Truck } from "lucide-react";
import { PublicLayout } from "@/components/cuma/PublicLayout";
import { PageHero } from "@/components/cuma/PageHero";
import { addressesQuery } from "@/lib/queries";
import { BANKS, COURIERS, cartQuery, cartSubtotal, estimateShipping } from "@/lib/cart";
import type { Bank, Courier } from "@/lib/cart";
import { useUserId } from "@/lib/use-user";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Cuma Biji" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { userId } = useUserId();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: cart } = useQuery({ ...cartQuery(userId), enabled: !!userId });
  const { data: addresses } = useQuery({ ...addressesQuery(userId), enabled: !!userId });

  const items = cart?.items ?? [];
  const subtotal = cartSubtotal(items);
  const totalWeight = items.reduce((s, i) => s + (i.weight_g ?? 250) * i.qty, 0);

  const [addressId, setAddressId] = useState<string>("");
  const [courier, setCourier] = useState<Courier>("jne");
  const [bank, setBank] = useState<Bank>("bca");
  const [voucher, setVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    type: "percent" | "amount" | "free_shipping";
    value: number;
  } | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!addressId && addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setAddressId(def.id);
    }
  }, [addresses, addressId]);

  const shipping = useMemo(() => estimateShipping(totalWeight, courier), [totalWeight, courier]);

  const discount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === "percent") return Math.floor((subtotal * appliedVoucher.value) / 100);
    if (appliedVoucher.type === "amount") return Math.min(appliedVoucher.value, subtotal);
    if (appliedVoucher.type === "free_shipping") return shipping;
    return 0;
  }, [appliedVoucher, subtotal, shipping]);

  const estimatedTotal = Math.max(0, subtotal - discount + shipping);

  async function applyVoucher() {
    const code = voucher.trim().toUpperCase();
    if (!code) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("code,type,value,min_subtotal,is_active,expires_at,max_uses,used_count")
      .ilike("code", code)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) {
      toast.error("Voucher tidak ditemukan");
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("Voucher kadaluarsa");
      return;
    }
    if (data.max_uses && data.used_count >= data.max_uses) {
      toast.error("Kuota voucher habis");
      return;
    }
    if (subtotal < data.min_subtotal) {
      toast.error(`Min belanja ${formatIDR(data.min_subtotal)}`);
      return;
    }
    setAppliedVoucher({ code: data.code, type: data.type as "percent" | "amount" | "free_shipping", value: data.value });
    toast.success(`Voucher ${data.code} dipakai`);
  }

  async function placeOrder() {
    if (items.length === 0) return toast.error("Keranjang kosong");
    if (!addressId) return toast.error("Pilih alamat pengiriman");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("place_order", {
        p_address_id: addressId,
        p_courier: courier,
        p_bank: bank,
        p_shipping_cost: shipping,
        p_voucher_code: appliedVoucher?.code ?? "",
        p_note: note || "",
      });
      if (error) throw error;
      const order = data as { order_number: string };
      qc.invalidateQueries({ queryKey: ["cart", userId] });
      qc.invalidateQueries({ queryKey: ["orders", userId] });
      toast.success("Pesananmu sudah masuk ☕");
      navigate({ to: "/pesanan-sukses/$orderNumber", params: { orderNumber: order.order_number } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="container-editorial py-24 text-center">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 font-display text-3xl text-[color:var(--coffee)]">Keranjang kosong</h1>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-full bg-[color:var(--coffee)] px-5 py-2.5 text-sm text-[color:var(--primary-foreground)]"
          >
            Mulai belanja
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHero eyebrow="Checkout" title="Selesaikan pesananmu." />
      <section className="container-editorial grid gap-10 pb-24 md:grid-cols-12">
        <div className="space-y-8 md:col-span-7">
          {/* ADDRESS */}
          <Section icon={<MapPin className="h-4 w-4" />} title="Alamat pengiriman">
            {addresses && addresses.length > 0 ? (
              <div className="grid gap-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                      addressId === a.id
                        ? "border-[color:var(--coffee)] bg-[color:var(--cream)]"
                        : "border-[color:var(--border)] bg-[color:var(--background)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addr"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                      className="mt-1 accent-[color:var(--coffee)]"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-[color:var(--coffee)]">
                        {a.label} · {a.recipient}
                      </p>
                      <p className="text-[color:var(--muted-foreground)]">{a.phone}</p>
                      <p className="text-[color:var(--muted-foreground)]">
                        {a.street}, {a.city}, {a.province} {a.postal_code}
                      </p>
                    </div>
                  </label>
                ))}
                <Link
                  to="/akun/alamat"
                  className="inline-flex items-center gap-1 text-xs text-[color:var(--coffee)] underline"
                >
                  <Plus className="h-3 w-3" /> Kelola alamat
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[color:var(--border)] p-6 text-center text-sm">
                Belum ada alamat tersimpan.
                <br />
                <Link to="/akun/alamat" className="mt-2 inline-block text-[color:var(--coffee)] underline">
                  Tambah alamat dulu →
                </Link>
              </div>
            )}
          </Section>

          {/* SHIPPING */}
          <Section icon={<Truck className="h-4 w-4" />} title="Pengiriman">
            <div className="grid gap-3 sm:grid-cols-2">
              {COURIERS.map((c) => (
                <label
                  key={c.v}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 ${
                    courier === c.v
                      ? "border-[color:var(--coffee)] bg-[color:var(--cream)]"
                      : "border-[color:var(--border)] bg-[color:var(--background)]"
                  }`}
                >
                  <div>
                    <p className="font-medium text-[color:var(--coffee)]">{c.l}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">{c.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatIDR(estimateShipping(totalWeight, c.v))}</p>
                    <input
                      type="radio"
                      name="courier"
                      checked={courier === c.v}
                      onChange={() => setCourier(c.v)}
                      className="mt-1 accent-[color:var(--coffee)]"
                    />
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
              Ongkir adalah estimasi berdasarkan berat total. Admin dapat menyesuaikan setelah pesanan dikemas.
            </p>
          </Section>

          {/* VOUCHER */}
          <Section icon={<Tag className="h-4 w-4" />} title="Voucher">
            <div className="flex gap-2">
              <input
                value={voucher}
                onChange={(e) => setVoucher(e.target.value)}
                placeholder="WELCOME10"
                className="flex-1 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-4 py-2 text-sm uppercase tracking-wider focus:border-[color:var(--coffee)] focus:outline-none"
              />
              <button
                type="button"
                onClick={applyVoucher}
                className="rounded-full border border-[color:var(--coffee)] px-4 py-2 text-sm text-[color:var(--coffee)] hover:bg-[color:var(--coffee)] hover:text-[color:var(--cream)]"
              >
                Pakai
              </button>
            </div>
            {appliedVoucher && (
              <p className="mt-2 text-xs text-[color:var(--coffee)]">
                ✓ {appliedVoucher.code} dipakai — hemat {formatIDR(discount)}
              </p>
            )}
          </Section>

          {/* BANK */}
          <Section title="Metode pembayaran">
            <div className="grid gap-3 sm:grid-cols-2">
              {BANKS.map((b) => (
                <label
                  key={b.v}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 ${
                    bank === b.v
                      ? "border-[color:var(--coffee)] bg-[color:var(--cream)]"
                      : "border-[color:var(--border)] bg-[color:var(--background)]"
                  }`}
                >
                  <div>
                    <p className="font-medium text-[color:var(--coffee)]">Transfer {b.l}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">{b.account}</p>
                  </div>
                  <input
                    type="radio"
                    name="bank"
                    checked={bank === b.v}
                    onChange={() => setBank(b.v)}
                    className="accent-[color:var(--coffee)]"
                  />
                </label>
              ))}
            </div>
          </Section>

          {/* NOTE */}
          <Section title="Catatan (opsional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Contoh: titip pesan untuk barista, atau permintaan pengemasan."
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] p-3 text-sm focus:border-[color:var(--coffee)] focus:outline-none"
            />
          </Section>
        </div>

        {/* SUMMARY */}
        <aside className="md:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-[color:var(--border)] bg-[color:var(--cream)] p-6">
            <p className="eyebrow">Ringkasan pesanan</p>
            <ul className="mt-4 divide-y divide-[color:var(--border)]">
              {items.map((it) => (
                <li key={it.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[color:var(--coffee)]">{it.name_snapshot}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">x{it.qty}</p>
                  </div>
                  <p className="shrink-0 font-medium">{formatIDR(it.unit_price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-[color:var(--border)] pt-4 text-sm">
              <Row k="Subtotal" v={formatIDR(subtotal)} />
              <Row k="Ongkir (est.)" v={formatIDR(shipping)} />
              {discount > 0 && <Row k={`Diskon ${appliedVoucher?.code ?? ""}`} v={`- ${formatIDR(discount)}`} />}
              <Row k="Total estimasi" v={formatIDR(estimatedTotal)} bold />
            </dl>
            <p className="mt-2 text-[10px] text-[color:var(--muted-foreground)]">
              Total final ditambah kode unik 3 digit untuk verifikasi.
            </p>
            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting || !addressId}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--coffee)] px-5 py-3 text-sm font-medium text-[color:var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Memproses…" : "Buat pesanan"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-[color:var(--coffee)]">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-medium text-[color:var(--coffee)]" : ""}`}>
      <dt className={bold ? "" : "text-[color:var(--muted-foreground)]"}>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
