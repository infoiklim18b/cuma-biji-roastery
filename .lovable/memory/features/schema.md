---
name: Database schema
description: All public tables, enums, and the order-number generator
type: feature
---

## Enums
`app_role` (customer, admin) · `roast_level` (light, medium, medium_dark, dark) · `process_method` (washed, natural, honey, wet_hulled, anaerobic) · `grind_size` (whole_bean, espresso, v60, kalita, moka_pot, french_press, tubruk) · `product_kind` (single_origin, blend, accessory, custom) · `order_status` (menunggu_pembayaran, menunggu_verifikasi, diproses, dikirim, selesai, dibatalkan, refund) · `payment_status` (menunggu, diverifikasi, ditolak, refund) · `courier` (jne, jnt, sicepat, anteraja) · `bank` (bca, mandiri, bni, bri) · `blog_status` · `coupon_type` (percent, amount, free_shipping) · `subscription_tier` (explorer, nusantara, premium) · `subscription_status` · `notif_type`.

## Tables
profiles, user_roles, addresses, origins, categories, products, product_images, cart, cart_items, orders, order_items, payments, shipments, wishlist, reviews, review_photos, blog_categories, blogs, coupons, coupon_redemptions, notifications, loyalty_points, loyalty_transactions, subscriptions, subscription_deliveries, forum_threads, forum_posts, recipes, events, activity_logs.

## Order numbering
`public.order_seq` sequence + `public.generate_order_number()` BEFORE INSERT trigger sets `order_number = 'CBJ-' || YYYY || '-' || lpad(nextval, 6, '0')`. Never set order_number from client.

## Helpers
- `public.has_role(uuid, app_role)` — SECURITY DEFINER, callable from RLS.
- `public.handle_new_user()` — AFTER INSERT on auth.users → creates profile + grants 'customer' role.
- `public.set_updated_at()` — generic timestamp trigger.

## Seed data
6 origins, 4 categories, ~12 products (8 single origin + 2 blend + 3 accessories), 3 blogs, 2 vouchers (WELCOME10, GRATISONGKIR).
