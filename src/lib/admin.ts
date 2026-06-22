import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type Courier = Database["public"]["Enums"]["courier"];
type AppRole = Database["public"]["Enums"]["app_role"];

export type AdminOrderRow = Database["public"]["Tables"]["orders"]["Row"];

export const isAdminQuery = (userId: string) =>
  queryOptions({
    queryKey: ["is-admin", userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      if (error) return false;
      return !!data;
    },
    staleTime: 60_000,
  });

export const adminMetricsQuery = () =>
  queryOptions({
    queryKey: ["admin", "metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_dashboard_metrics");
      if (error) throw error;
      return data as {
        revenue_today: number;
        revenue_7d: number;
        revenue_30d: number;
        orders_count: number;
        orders_by_status: Record<string, number> | null;
        pending_verification: number;
        low_stock: number;
        new_customers_7d: number;
        revenue_series_30d: { day: string; revenue: number }[] | null;
        top_products: { id: string; name: string; thumbnail: string | null; sold: number; revenue: number }[] | null;
      };
    },
    staleTime: 30_000,
  });

export const adminOrdersQuery = (filters?: { status?: OrderStatus | "all"; search?: string }) =>
  queryOptions({
    queryKey: ["admin", "orders", filters ?? {}],
    queryFn: async () => {
      let q = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
      if (filters?.search) q = q.ilike("order_number", `%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });

export const adminOrderDetailQuery = (orderNumber: string) =>
  queryOptions({
    queryKey: ["admin", "order", orderNumber],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(*), payments(*), shipments(*), profiles!orders_user_id_fkey(full_name,phone)")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (error) throw error;
      return order;
    },
    staleTime: 10_000,
  });

export const adminPaymentsQueueQuery = () =>
  queryOptions({
    queryKey: ["admin", "payments-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, orders(order_number, user_id, total, status)")
        .not("proof_url", "is", null)
        .in("status", ["menunggu", "menunggu_verifikasi"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10_000,
  });

export const adminProductsQuery = () =>
  queryOptions({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, origins(name), categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const adminProductByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const adminOriginsQuery = () =>
  queryOptions({
    queryKey: ["admin", "origins"],
    queryFn: async () => {
      const { data, error } = await supabase.from("origins").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminCategoriesQuery = () =>
  queryOptions({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminBlogsQuery = () =>
  queryOptions({
    queryKey: ["admin", "blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*, blog_categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminBlogByIdQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin", "blog", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

export const adminBlogCategoriesQuery = () =>
  queryOptions({
    queryKey: ["admin", "blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_categories").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminCouponsQuery = () =>
  queryOptions({
    queryKey: ["admin", "coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminCustomersQuery = (search?: string) =>
  queryOptions({
    queryKey: ["admin", "customers", search ?? ""],
    queryFn: async () => {
      let q = supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (search) q = q.ilike("full_name", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const adminReviewsQuery = () =>
  queryOptions({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(name,slug), profiles!reviews_user_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

export const storeSettingsQuery = () =>
  queryOptions({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

// ============ Mutations (thin wrappers around RPCs / DML) ============

export async function bootstrapFirstAdmin() {
  const { data, error } = await supabase.rpc("bootstrap_first_admin");
  if (error) throw error;
  return data;
}

export async function verifyPayment(paymentId: string, approve: boolean, note?: string) {
  const { data, error } = await supabase.rpc("admin_verify_payment", {
    p_payment_id: paymentId,
    p_approve: approve,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data;
}

export async function setShipment(orderId: string, courier: Courier, tracking: string) {
  const { data, error } = await supabase.rpc("admin_set_shipment", {
    p_order_id: orderId,
    p_courier: courier,
    p_tracking: tracking,
  });
  if (error) throw error;
  return data;
}

export async function setOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const { data, error } = await supabase.rpc("admin_set_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data;
}

export async function refundOrder(orderId: string, reason?: string) {
  const { data, error } = await supabase.rpc("admin_refund_order", {
    p_order_id: orderId,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  return data;
}

export async function adjustShipping(orderId: string, newShipping: number) {
  const { data, error } = await supabase.rpc("admin_adjust_shipping", {
    p_order_id: orderId,
    p_new_shipping: newShipping,
  });
  if (error) throw error;
  return data;
}

export async function setUserRole(userId: string, role: AppRole, grant: boolean) {
  const { data, error } = await supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_role: role,
    p_grant: grant,
  });
  if (error) throw error;
  return data;
}

export type { OrderStatus, PaymentStatus, Courier, AppRole };
