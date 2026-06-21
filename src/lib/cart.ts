import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Grind = Database["public"]["Enums"]["grind_size"];
export type Courier = Database["public"]["Enums"]["courier"];
export type Bank = Database["public"]["Enums"]["bank"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];

export type CartItemRow = {
  id: string;
  cart_id: string;
  product_id: string | null;
  name_snapshot: string;
  qty: number;
  unit_price: number;
  weight_g: number | null;
  grind: Grind | null;
  custom_config: Record<string, unknown> | null;
  products: { slug: string; thumbnail: string | null; stock: number } | null;
};

export async function getOrCreateCart(userId: string): Promise<string> {
  const existing = await supabase.from("cart").select("id").eq("user_id", userId).maybeSingle();
  if (existing.data?.id) return existing.data.id;
  const ins = await supabase.from("cart").insert({ user_id: userId }).select("id").single();
  if (ins.error) throw ins.error;
  return ins.data.id;
}

export const cartQuery = (userId: string) =>
  queryOptions({
    queryKey: ["cart", userId],
    queryFn: async () => {
      if (!userId) return { items: [] as CartItemRow[], cartId: "" as string };
      const cartId = await getOrCreateCart(userId);
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          "id,cart_id,product_id,name_snapshot,qty,unit_price,weight_g,grind,custom_config,products(slug,thumbnail,stock)",
        )
        .eq("cart_id", cartId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return { items: (data ?? []) as unknown as CartItemRow[], cartId };
    },
    staleTime: 5_000,
  });

export async function addProductToCart(
  userId: string,
  product: { id: string; name: string; price: number; weight_g: number | null },
  qty = 1,
) {
  const cartId = await getOrCreateCart(userId);
  const existing = await supabase
    .from("cart_items")
    .select("id,qty")
    .eq("cart_id", cartId)
    .eq("product_id", product.id)
    .is("custom_config", null)
    .maybeSingle();
  if (existing.data) {
    const { error } = await supabase
      .from("cart_items")
      .update({ qty: existing.data.qty + qty })
      .eq("id", existing.data.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: product.id,
    name_snapshot: product.name,
    qty,
    unit_price: product.price,
    weight_g: product.weight_g,
  });
  if (error) throw error;
}

export async function addCustomToCart(
  userId: string,
  config: { origin: string; roast: string; weight: number; grind: Grind; price: number; name: string },
) {
  const cartId = await getOrCreateCart(userId);
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: null,
    name_snapshot: config.name,
    qty: 1,
    unit_price: config.price,
    weight_g: config.weight,
    grind: config.grind,
    custom_config: { origin: config.origin, roast: config.roast } as never,
  });
  if (error) throw error;
}

export async function updateCartItemQty(itemId: string, qty: number) {
  if (qty < 1) return removeCartItem(itemId);
  const { error } = await supabase.from("cart_items").update({ qty }).eq("id", itemId);
  if (error) throw error;
}

export async function removeCartItem(itemId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw error;
}

export function cartSubtotal(items: CartItemRow[]) {
  return items.reduce((s, i) => s + i.unit_price * i.qty, 0);
}

export const COURIERS: { v: Courier; l: string; desc: string }[] = [
  { v: "jne", l: "JNE", desc: "Reguler 2–4 hari" },
  { v: "jnt", l: "J&T", desc: "Reguler 2–4 hari" },
  { v: "sicepat", l: "SiCepat", desc: "Reg 2–3 hari" },
  { v: "anteraja", l: "AnterAja", desc: "Reg 2–3 hari" },
];

export const BANKS: { v: Bank; l: string; account: string; holder: string }[] = [
  { v: "bca", l: "BCA", account: "1234567890", holder: "PT Cuma Biji Nusantara" },
  { v: "mandiri", l: "Mandiri", account: "1330099887766", holder: "PT Cuma Biji Nusantara" },
  { v: "bni", l: "BNI", account: "0987654321", holder: "PT Cuma Biji Nusantara" },
  { v: "bri", l: "BRI", account: "5544332211", holder: "PT Cuma Biji Nusantara" },
];

export function estimateShipping(totalWeightG: number, courier: Courier): number {
  const kg = Math.max(1, Math.ceil(totalWeightG / 1000));
  const base: Record<Courier, number> = { jne: 15000, jnt: 14000, sicepat: 16000, anteraja: 13000 };
  return base[courier] * kg;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_pembayaran: "Menunggu pembayaran",
  menunggu_verifikasi: "Menunggu verifikasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  refund: "Refund",
};

export const ordersQuery = (userId: string, status?: OrderStatus, search?: string) =>
  queryOptions({
    queryKey: ["orders", userId, status ?? "all", search ?? ""],
    queryFn: async () => {
      if (!userId) return [];
      let q = supabase
        .from("orders")
        .select("id,order_number,status,total,created_at,subtotal,discount,shipping_cost,bank,courier,paid_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (status) q = q.eq("status", status);
      if (search) q = q.ilike("order_number", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });

export const orderDetailQuery = (orderNumber: string) =>
  queryOptions({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "*,order_items(*),payments(*),shipments(*)",
        )
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 10_000,
  });

export const notificationsQuery = (userId: string) =>
  queryOptions({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });

export const unreadCountQuery = (userId: string) =>
  queryOptions({
    queryKey: ["notif-unread", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 15_000,
  });
