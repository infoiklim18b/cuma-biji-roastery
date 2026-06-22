# Stage 3 — Admin Dashboard

Stage 0–2 sudah live (infra, katalog, transaksi end-to-end customer). Stage ini membangun **Admin Dashboard** untuk operasional Cuma Biji: verifikasi pembayaran, proses pesanan, input resi, kelola produk/blog/voucher, dan dashboard metrik. Belum menyentuh loyalty/subscription/forum (Stage 4).

## Akses & guard

- Role `admin` sudah ada di enum `app_role` + tabel `user_roles` (Stage 0).
- Layout baru `src/routes/_authenticated/admin/route.tsx` — child gate: cek `has_role(auth.uid(), 'admin')`. Bukan admin → redirect ke `/akun` + toast.
- Sidebar admin pakai shadcn `Sidebar` (collapsible icon), header tipis dengan search + notif + akun.
- Seed: 1 user admin awal via migrasi (grant role admin ke email yang user tentukan — akan ditanyakan saat eksekusi, atau dibuat helper RPC `promote_to_admin` yang hanya bisa dipanggil sekali bila belum ada admin).

## Halaman admin

```
/admin                         Dashboard ringkasan
/admin/pesanan                 List semua orders (filter status, search, tanggal)
/admin/pesanan/$orderNumber    Detail + aksi (verifikasi bayar, input resi, ubah status, refund)
/admin/pembayaran              Queue pembayaran menunggu verifikasi
/admin/produk                  Tabel produk + CRUD
/admin/produk/baru             Form create
/admin/produk/$id              Form edit (gambar, stok, harga, publish toggle)
/admin/origins                 CRUD origin
/admin/kategori                CRUD kategori
/admin/blog                    List blog + CRUD
/admin/blog/baru, /admin/blog/$id
/admin/voucher                 CRUD coupons
/admin/pelanggan               List user + detail (orders, total spend, role)
/admin/ulasan                  Moderasi reviews (approve / hapus)
/admin/pengaturan              Rekening bank, info toko, ongkir default
```

## Server functions (`src/lib/admin.*.functions.ts`)

Semua pakai `requireSupabaseAuth` + cek `has_role(userId,'admin')` di awal handler — kalau bukan admin, throw 403. Return DTO plain.

- `admin.orders.functions.ts`: `listOrders`, `getOrderDetail`, `verifyPayment` (approve/reject bukti), `setShipment` (kurir+resi, status→`dikirim`, kirim notif), `setOrderStatus`, `refundOrder`, `adjustShippingCost`.
- `admin.products.functions.ts`: `listProducts`, `upsertProduct`, `deleteProduct`, `uploadProductImage` (ke bucket `product-images`), `reorderImages`.
- `admin.taxonomy.functions.ts`: CRUD `origins`, `categories`.
- `admin.blog.functions.ts`: CRUD `blogs` + `blog_categories`, upload thumbnail.
- `admin.coupons.functions.ts`: CRUD `coupons`.
- `admin.customers.functions.ts`: `listCustomers` (join orders aggregate), `getCustomerDetail`, `setUserRole` (grant/revoke admin — hanya admin lain yang boleh).
- `admin.reviews.functions.ts`: `listReviews`, `deleteReview`.
- `admin.metrics.functions.ts`: `getDashboardMetrics` (revenue 7/30/90 hari, AOV, jumlah order per status, top produk, low-stock alert, new customers).
- `admin.settings.functions.ts`: get/set konfigurasi toko (disimpan di tabel baru `store_settings` single-row, atau `activity_logs`-style key/value).

## Komponen baru

`AdminLayout`, `AdminSidebar`, `AdminHeader`, `StatCard`, `MetricChart` (recharts), `OrdersTable`, `OrderStatusBadge`, `PaymentVerificationCard` (preview bukti + approve/reject), `ShipmentForm` (kurir + resi), `ProductForm` (multi-image dropzone, tasting notes editor, sliders aroma/body/acidity), `BlogEditor` (textarea markdown + preview), `CouponForm`, `DataTable` (reusable dengan sort/pagination/filter), `ConfirmDialog`, `RoleBadge`, `LowStockAlert`.

## Database (migrasi tambahan)

- Tabel baru `public.store_settings` (single row, RLS admin-only): rekening bank list (jsonb), info toko, default origin tujuan ongkir, threshold low-stock.
- RLS policies tambahan: admin bisa SELECT/UPDATE semua `orders`, `payments`, `shipments`, `products`, `blogs`, `coupons`, `reviews`, `profiles`, `user_roles` via `has_role(auth.uid(),'admin')`. Pakai pola SECURITY DEFINER yang sudah ada.
- RPC baru:
  - `admin_verify_payment(p_payment_id, p_approve bool, p_note)` — update `payments.status`, kalau approve → `orders.status='diproses'`, kirim notif user.
  - `admin_set_shipment(p_order_id, p_courier, p_tracking)` — update `shipments`, `orders.status='dikirim'`, notif.
  - `admin_refund_order(p_order_id, p_reason)` — restore stok, status refund, notif.
  - `admin_set_user_role(p_user_id, p_role, p_grant bool)` — guard: caller harus admin.
- Storage policies: admin write ke `product-images`, `blog-images`. Public read tetap via signed URL atau bucket public (untuk product/blog — pertimbangkan ubah bucket jadi public). Akan dikonfirmasi: **product-images & blog-images saya jadikan public bucket** supaya gambar muncul tanpa signed URL ribet di customer side.
- Index: `orders(status, created_at)`, `payments(status)`, `products(is_published, kind)`.

## Dashboard `/admin`

Kartu metrik: revenue hari ini / 7d / 30d, jumlah order per status (badge), pembayaran menunggu verifikasi (CTA), low-stock products, new customers 7d. Grafik garis revenue 30d, bar top 5 produk, list 10 pesanan terbaru.

## UX & quality

- Tabel pakai TanStack Query + pagination server-side (limit/offset).
- Form Zod + react-hook-form, optimistic update + rollback on error.
- Toast Bahasa Indonesia konsisten dengan customer side.
- Loading skeleton di semua tabel & dashboard.
- Empty state per halaman.
- Konfirmasi destructive (hapus produk, refund, revoke admin).
- Mobile-responsive: sidebar collapse jadi sheet, tabel scroll horizontal.
- Audit: setiap aksi admin (verify payment, set resi, refund, role change) insert ke `activity_logs`.

## Header customer-side

Tambah link "Admin" di dropdown akun **hanya jika** user punya role admin (cek via `has_role` query). Tidak ubah landing.

## Yang TIDAK dikerjakan stage ini

- Loyalty redeem & subscription management → Stage 4.
- Forum moderation, recipe, event CMS → Stage 4.
- Email/WA outbound (mis. notif resi via WA) → Stage 4 / integrasi.
- Export CSV pesanan → opsional, bisa ditambah jika diminta.
- Multi-admin permission granular (semua admin = full akses di stage ini).

## Catatan eksekusi

- Saat eksekusi nanti, saya akan minta **email user yang mau dijadikan admin pertama** untuk seed role. Atau buat halaman one-time `/admin/setup` yang grant admin ke caller bila belum ada admin sama sekali.
- Bucket `product-images` & `blog-images` akan saya ubah jadi **public** (read) supaya `<img>` di customer langsung jalan. Upload tetap admin-only via RLS.

Balas **"lanjut"** untuk mulai eksekusi Stage 3, atau beri tahu jika ada bagian yang ingin dipangkas (mis. skip metrik/grafik dulu, atau skip moderasi review).
