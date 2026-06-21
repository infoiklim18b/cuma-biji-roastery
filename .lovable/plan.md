# Stage 2 — Keranjang, Checkout, Pembayaran, Tracking, Notifikasi

Stage 0 (infra + auth) dan Stage 1 (katalog publik + akun shell) sudah live. Stage ini menyalakan seluruh alur transaksi end-to-end dengan **manual bank transfer + manual ongkir**, plus pusat notifikasi user. Belum menyentuh admin (Stage 3) maupun loyalty/subscription/forum (Stage 4).

## Alur yang dibangun

1. **Keranjang `/keranjang`** — cart user (`cart` + `cart_items`), qty +/-, hapus, sub-total, badge "stok tersisa", kosong → empty state CTA ke `/shop`. Mini-cart drawer di Header (icon shopping bag → Sheet) tampil di semua halaman, sync via TanStack Query invalidation.
2. **Tambah ke keranjang** — `ProductCard`, `produk/$slug`, dan **Custom Wizard** sekarang benar-benar menulis `cart_items` (untuk custom: simpan konfigurasi origin/roast/berat/grind di kolom `meta jsonb` + `product_kind='custom'`). Toast sukses + tombol "Lihat keranjang".
3. **Checkout `/checkout`** — 3 langkah dalam satu halaman (stepper):
   - **Alamat** — pilih dari `addresses` atau tambah baru (reuse `AddressForm`).
   - **Pengiriman** — pilih kurir (JNE/JNT/SiCepat/Anteraja) + service level + **manual ongkir** (input nominal oleh user dari kalkulator estimasi sederhana berbasis berat & zona → tampil sebagai estimasi, dikonfirmasi admin nanti). Plus voucher (`WELCOME10`, `GRATISONGKIR`) via `coupons` + `coupon_redemptions` dengan validasi server-side.
   - **Pembayaran** — pilih bank tujuan (BCA/Mandiri/BNI/BRI) dari konstanta rekening Cuma Biji, ringkasan order, tombol **Buat Pesanan**.
   Submit memanggil `createOrder` server fn (`requireSupabaseAuth`) yang dalam satu transaksi: hitung ulang harga & diskon di server (jangan percaya client), kunci stok, buat `orders` (trigger auto-generate `CBJ-YYYY-NNNNNN`), `order_items` snapshot, `payments` (status `menunggu`), `shipments` draft, increment `coupon_redemptions`, kosongkan `cart_items`, kirim `notifications` "Pesanan dibuat".
4. **Order Confirmation `/checkout/sukses/$orderNumber`** — instruksi transfer (bank, no rek, atas nama, nominal **unik** = total + 3 digit random untuk memudahkan verifikasi), countdown 24 jam, tombol "Upload bukti transfer".
5. **Upload bukti `/akun/pesanan/$orderNumber/bayar`** — upload ke bucket `payment-proofs` (path `${userId}/${orderId}/...`), update `payments.proof_url` + status `menunggu_verifikasi`, update `orders.status` → `menunggu_verifikasi`, kirim notifikasi.
6. **Detail pesanan `/akun/pesanan/$orderNumber`** — timeline status (menunggu_pembayaran → menunggu_verifikasi → diproses → dikirim → selesai), ringkasan item, alamat, total, info pembayaran, info pengiriman (kurir + resi bila ada), tombol **Tandai diterima** saat status `dikirim`, tombol **Batalkan** saat masih `menunggu_pembayaran`.
7. **Daftar pesanan `/akun/pesanan`** — list real dari DB, filter status, search by order_number, pagination.
8. **Review produk** — di detail order ber-status `selesai`, tombol **Tulis ulasan** per item → modal dengan rating 1-5 + body + upload foto opsional ke `review-photos`. `/akun/review` menampilkan review yang sudah & belum ditulis.
9. **Wishlist** — tombol heart di `ProductCard` dan `/produk/$slug` sekarang aktif (insert/delete `wishlist`). `/akun/wishlist` sudah ada datanya, tambah tombol "Pindah ke keranjang".
10. **Notifikasi** — dropdown bell di Header (badge unread count), pull dari `notifications`, klik → tandai read + navigate ke target (`/akun/pesanan/...`). Halaman penuh `/akun/notifikasi`.

## Komponen baru

`CartDrawer`, `CartLineItem`, `QuantityStepper`, `CheckoutStepper`, `AddressPicker`, `ShippingPicker`, `VoucherInput`, `OrderSummary`, `BankInstructionCard`, `CountdownTimer`, `OrderStatusTimeline`, `OrderCard`, `ProofUploader`, `ReviewModal`, `WishlistButton`, `NotificationBell`, `NotificationItem`, `EmptyCart`.

## Server functions (`src/lib/*.functions.ts`)

Semua `requireSupabaseAuth`, hitung ulang di server, return DTO plain:
- `cart.functions.ts`: `getMyCart`, `addToCart`, `updateCartItem`, `removeCartItem`, `clearCart`.
- `checkout.functions.ts`: `previewCheckout` (validasi voucher + total), `createOrder` (transaksi penuh).
- `orders.functions.ts`: `getMyOrders`, `getMyOrderByNumber`, `cancelOrder`, `markOrderReceived`.
- `payments.functions.ts`: `submitPaymentProof` (validasi MIME + ukuran, simpan path).
- `wishlist.functions.ts`: `toggleWishlist`.
- `reviews.functions.ts`: `submitReview`.
- `notifications.functions.ts`: `listMyNotifications`, `markRead`, `markAllRead`, `unreadCount`.

`attachSupabaseAuth` sudah terdaftar di `src/start.ts` dari Stage 0 — tinggal pakai.

## Data & RLS

Tabel sudah ada (Stage 0). Migrasi tambahan kecil:
- Index pada `cart_items(cart_id)`, `order_items(order_id)`, `notifications(user_id, is_read)`.
- Helper SQL function `public.compute_order_totals(p_user uuid, p_coupon text, p_shipping_cost int)` (SECURITY DEFINER) untuk hitung subtotal + diskon + ongkir konsisten.
- Storage policy `payment-proofs`: user hanya bisa upload/baca file di prefix `${auth.uid()}/...`.
- Storage policy `review-photos`: user bisa upload di prefix `${auth.uid()}/...`, baca publik (signed URL via server fn untuk tampilan).
- Tidak ada perubahan skema tabel.

## UX & validation

- Semua form Zod (alamat, voucher, qty, upload).
- Toast Bahasa Indonesia hangat ("Pesananmu sudah masuk, tinggal transfer ya ☕").
- Loading skeleton di cart, checkout summary, order detail.
- Empty states: keranjang kosong, belum ada pesanan, belum ada notifikasi.
- Error states: stok habis saat checkout, voucher invalid, upload gagal, total mismatch.
- Optimistic update untuk qty cart & toggle wishlist.
- Mobile-first responsive: checkout 1 kolom di mobile, 2 kolom (form + sticky summary) di desktop.

## Routing baru

```
/keranjang                                 (sudah ada → diisi)
/checkout
/checkout/sukses/$orderNumber
/_authenticated/akun/pesanan               (diisi)
/_authenticated/akun/pesanan/$orderNumber
/_authenticated/akun/pesanan/$orderNumber/bayar
/_authenticated/akun/notifikasi
```

## Yang TIDAK dikerjakan stage ini

- Admin verifikasi pembayaran, input resi, ubah status → **Stage 3**.
- Email/WA notifikasi keluar → cukup in-app notifikasi dulu.
- Refund flow lengkap → status `refund` ada, UI hanya read-only.
- Subscription, loyalty redeem, forum, recipe, event → **Stage 4**.

## Catatan teknis

- Ongkir manual: user input estimasi, admin bisa adjust di Stage 3. Simpan `shipping_cost_estimated` & `shipping_cost_final` di `orders` (pakai kolom yang sudah ada).
- Nomor unik transfer: simpan `unique_amount_suffix` (0-999) di `orders` agar verifikasi admin gampang.
- Stok: decrement saat `createOrder`, restore saat `cancelOrder`.
- Custom coffee item: `product_id` null, `meta jsonb` simpan konfigurasi, harga dihitung server-side dari formula (base + roast premium + grind).

Balas **"lanjut"** untuk mulai eksekusi Stage 2, atau beri tahu jika ada bagian yang ingin dipangkas / diprioritaskan (mis. skip notifikasi dulu, atau skip review).
