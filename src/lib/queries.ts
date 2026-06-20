import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: "single_origin" | "blend" | "accessory" | "custom";
  price: number;
  compare_price: number | null;
  stock: number;
  weight_g: number | null;
  thumbnail: string | null;
  roast_level: string | null;
  process: string | null;
  tasting_notes: string[] | null;
  aroma: number | null;
  body: number | null;
  acidity: number | null;
  is_featured: boolean;
  sold_count: number;
  origin_id: string | null;
  category_id: string | null;
  origins?: { slug: string; name: string; region: string } | null;
  categories?: { slug: string; name: string } | null;
};

const PRODUCT_COLS =
  "id,slug,name,description,kind,price,compare_price,stock,weight_g,thumbnail,roast_level,process,tasting_notes,aroma,body,acidity,is_featured,sold_count,origin_id,category_id,origins(slug,name,region),categories(slug,name)";

export const productsQuery = (filters?: {
  kind?: string;
  originSlug?: string;
  roastLevel?: string;
  process?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
}) =>
  queryOptions({
    queryKey: ["products", filters ?? {}],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select(PRODUCT_COLS)
        .eq("is_published", true);

      if (filters?.kind) q = q.eq("kind", filters.kind as never);
      if (filters?.roastLevel) q = q.eq("roast_level", filters.roastLevel as never);
      if (filters?.process) q = q.eq("process", filters.process as never);
      if (filters?.minPrice != null) q = q.gte("price", filters.minPrice);
      if (filters?.maxPrice != null) q = q.lte("price", filters.maxPrice);
      if (filters?.search) q = q.ilike("name", `%${filters.search}%`);

      switch (filters?.sort) {
        case "price_asc":
          q = q.order("price", { ascending: true });
          break;
        case "price_desc":
          q = q.order("price", { ascending: false });
          break;
        case "best":
          q = q.order("sold_count", { ascending: false });
          break;
        default:
          q = q.order("created_at", { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as ProductRow[];
      if (filters?.originSlug) {
        rows = rows.filter((r) => r.origins?.slug === filters.originSlug);
      }
      return rows;
    },
    staleTime: 60_000,
  });

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`${PRODUCT_COLS},product_images(url,alt,sort_order)`)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as
        | (ProductRow & { product_images: { url: string; alt: string | null; sort_order: number }[] })
        | null;
    },
    staleTime: 60_000,
  });

export const originsQuery = () =>
  queryOptions({
    queryKey: ["origins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("origins")
        .select("id,slug,name,region,description,altitude,hero_image,sort_order")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

export const originBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["origin", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("origins")
        .select("id,slug,name,region,description,altitude,hero_image")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });

export const blogsQuery = (categorySlug?: string, search?: string) =>
  queryOptions({
    queryKey: ["blogs", { categorySlug, search }],
    queryFn: async () => {
      let q = supabase
        .from("blogs")
        .select(
          "id,slug,title,excerpt,thumbnail,published_at,category_id,blog_categories(slug,name)",
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (search) q = q.ilike("title", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      let rows = data ?? [];
      if (categorySlug) {
        rows = rows.filter(
          (r) => (r as { blog_categories?: { slug?: string } }).blog_categories?.slug === categorySlug,
        );
      }
      return rows;
    },
    staleTime: 60_000,
  });

export const blogBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select(
          "id,slug,title,excerpt,content,thumbnail,published_at,seo_title,seo_description,blog_categories(slug,name)",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

export const blogCategoriesQuery = () =>
  queryOptions({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id,slug,name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url,phone")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

export const addressesQuery = (userId: string) =>
  queryOptions({
    queryKey: ["addresses", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

export const wishlistQuery = (userId: string) =>
  queryOptions({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`id,created_at,products(${PRODUCT_COLS})`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        created_at: string;
        products: ProductRow;
      }>;
    },
    staleTime: 30_000,
  });

export const reviewsQuery = (productId: string) =>
  queryOptions({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,rating,comment,created_at,user_id,profiles(full_name,avatar_url)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
