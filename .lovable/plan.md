
# Cuma Biji — Full Web App Plan

You picked **everything including Phase 2**. That's too large for one turn at production quality. I'll deliver it in **5 staged builds**, each shippable on its own. After each stage you can test, then say "lanjut" to continue.

---

## Stage 0 — Foundation (this turn)

- Enable **Lovable Cloud** (auth, Postgres, storage).
- Set up design system in `src/styles.css`: sage `#A8BBA3`, bg `#FAF8F2`, cream `#F6F1E7`, coffee brown `#4A3728`, beige `#DCC8A3`, text `#2B2B2B`. Editorial typography (display + body via @fontsource), 12-col grid utilities, generous spacing scale.
- Public layout shell (header, footer, mega-nav) + reusable coffee-bean illustration components (SVG, generated once).
- Database schema + RLS for ALL entities below (one migration).
- Auth: email/password + Google, `profiles` table, `user_roles` table with `app_role` enum (`customer`, `admin`) + `has_role()` security-definer function.
- Storage buckets: `product-images` (public), `payment-proofs` (private), `blog-images` (public), `review-photos` (public), `avatars` (public).
- Seed: 6 origins (Gayo, Toraja, Kintamani, Java Preanger, Flores Bajawa, Papua), ~12 demo products, 3 blog posts, 2 voucher codes.

## Stage 1 — Public website + customer auth

Homepage, Shop (grid + filter + sort + pagination), Product detail (gallery, tasting notes, reviews, related), Single Origin, Blend, Custom Coffee Builder (4 steps), Accessories, Blog list + detail, About, Contact, Auth pages (login, register, forgot/reset, Google), Profile/Address book/Wishlist/Order history shells.

## Stage 2 — Cart → Checkout → Tracking

Cart (CRUD, voucher, catatan, subtotal, est. ongkir manual flat per kurir), Checkout (penerima, kurir JNE/J&T/SiCepat/AnterAja, bank BCA/Mandiri/BNI/BRI), Order number generator `CBJ-YYYY-NNNNNN`, Konfirmasi Pembayaran (upload bukti), Tracking timeline, Review produk (gated by purchase), Notifikasi (in-app bell + table).

## Stage 3 — Admin panel

Sidebar shell under `_authenticated/admin` gated by `has_role('admin')`. Dashboard (revenue, today's orders, top product, top origin, sales chart via recharts), Produk CRUD + bulk upload + low-stock alert, Pesanan list/filter, Verifikasi Pembayaran (zoom bukti, approve/reject + alasan), Input resi + update status, Refund, Pelanggan (LTV), Blog CRUD, Promo/Voucher CRUD, Analytics (view, ATC, checkout, purchase, conversion, repeat order).

## Stage 4 — Phase 2

Subscription Coffee (Explorer/Nusantara/Premium boxes), Loyalty points + rewards + membership tiers, Recommendation engine (collaborative + content-based on origin/roast), Community forum (threads, recipes, events).

---

## Database schema (Stage 0)

`profiles, user_roles, addresses, origins, categories, products, product_images, cart, cart_items, orders, order_items, payments, payment_proofs, shipments, wishlist, reviews, review_photos, blogs, blog_categories, coupons, coupon_redemptions, notifications, subscriptions, subscription_deliveries, loyalty_points, loyalty_transactions, activity_logs, forum_threads, forum_posts, recipes, events`

Every public-schema table gets `GRANT` + `ENABLE RLS` + policies scoped to `auth.uid()` or `has_role()`. Admin-only tables (`coupons`, `activity_logs`) gated by `has_role('admin')`.

## Tech notes

- TanStack Start file routes. Public routes top-level; signed-in routes under `src/routes/_authenticated/`; admin under `src/routes/_authenticated/admin/`.
- Data: `createServerFn` + `requireSupabaseAuth` for user-scoped reads/writes; public reads via server publishable client; admin ops via `supabaseAdmin` loaded inside handlers after `has_role` check.
- TanStack Query for caching; loaders prime cache with `ensureQueryData`.
- Images: `imagegen` for hero, product placeholders, bean illustrations, blog thumbnails — generated as needed per stage.
- All copy in Bahasa Indonesia, friendly + premium + artisan tone.
- No Midtrans/RajaOngkir; ongkir is flat per kurir (editable in admin settings later).

---

## What I'll do **this turn** if you approve

Stage 0 only: enable Cloud, write the full migration with RLS + grants, set up design tokens + fonts + layout shell + bean SVGs, scaffold auth pages, seed origins/products/blog. No customer flows yet — those start in Stage 1.

Reply **"lanjut"** to start Stage 0, or tell me to adjust scope/order.
