# Stage 1 — Public website + customer auth (build-ready)

Stage 0 sudah live (Cloud, schema lengkap + RLS, design tokens, layout shell, homepage, auth email + Google, akun shell, seed). Stage ini mengisi seluruh permukaan publik dan etalase produk. Tidak menyentuh cart/checkout/admin (itu Stage 2 & 3).

## Halaman yang dibangun

1. **Shop `/shop`** — grid produk 3–4 kolom, filter sidebar (Origin, Roast Level, Process Method, rentang harga, rating), sort (Terbaru / Terlaris / Harga ↑ / Harga ↓), pagination 12 per halaman, search bar. Data dari `products` + `origins` via public server fn (publishable client, `TO anon` SELECT policy yang sudah ada).
2. **Product Detail `/produk/$slug`** — galeri foto, nama, harga, stock badge, berat, origin (link), ketinggian, process, roast level, tasting notes chip, aroma/body/acidity bar, blok review + rating rata-rata, produk terkait (origin atau kategori sama). Tombol **Tambah ke Keranjang** & **Wishlist** masih stub toast "tersedia di tahap berikutnya" — slot logic Stage 2.
3. **Single Origin `/single-origin`** — list 6 origin Nusantara sebagai kartu editorial (peta region kecil pakai ilustrasi, tasting profile, ketinggian, proses umum), tiap kartu link ke `/single-origin/$slug` dengan deskripsi panjang + daftar produk origin tsb.
4. **Blend `/blend`** — list produk `kind = blend` dengan narasi house blend.
5. **Custom Coffee Builder `/custom`** — wizard 4 langkah (Origin → Roast → Berat → Grind), progress indicator, preview ringkas + estimasi harga, tombol **Tambah ke Keranjang** stub (Stage 2 akan menulis ke `cart_items` dengan `product_kind = custom`). State lokal via `useReducer`.
6. **Accessories `/accessories`** — grid kategori aksesoris (V60, Kalita, Moka Pot, French Press, grinder, dsb) dari `products` kind `accessory`.
7. **Blog `/blog` & `/blog/$slug`** — list dengan kategori (Panduan Seduh, Mengenal Origin, Roasting Guide, Coffee Knowledge), search, artikel detail dengan TOC, related article, share. Konten dari `blogs` + `blog_categories`.
8. **Tentang `/tentang`** — narasi brand, peta origin, value, tim.
9. **Kontak `/kontak`** — form (nama, email, pesan) divalidasi Zod, kirim ke server fn `submitContactMessage` yang menyimpan ke `activity_logs` (tipe `contact_message`).
10. **Auth `/auth` & `/reset-password`** — sudah ada Stage 0, tinggal poles state error (Bahasa Indonesia), inline “Lupa kata sandi?”, validasi Zod.
11. **Customer Account `_authenticated/akun.*`** — isi shell-nya:
    - `/akun` — kartu profil, ringkasan order terakhir, loyalty placeholder.
    - `/akun/profil` — edit `profiles` (nama, no HP, avatar upload ke bucket `avatars`).
    - `/akun/alamat` — CRUD `addresses` (set default).
    - `/akun/wishlist` — list dari `wishlist`, hapus.
    - `/akun/pesanan` — empty state "Belum ada pesanan" (data flow di Stage 2).
    - `/akun/review` — empty state.

## Komponen reusable (baru)

`ProductCard`, `ProductGrid`, `FilterSidebar`, `SortDropdown`, `PriceTag`, `RatingStars`, `TastingNoteChip`, `OriginCard`, `BlogCard`, `BlogToc`, `WizardStepper`, `AddressForm`, `EmptyState`, `SectionEyebrow`, `PageHero` — semua pakai tokens (`var(--coffee)`, `var(--sage)`, dst), tipografi Fraunces+Inter, hairline border, dekorasi `BeanMark` di slot ambient.

## Data layer

- Public reads (shop, product detail, blog, origin, related): `createServerFn` GET pakai server publishable client. Kolom dipilih ekslisit, tanpa kolom internal.
- User-scoped (profile, address, wishlist): `createServerFn` + `requireSupabaseAuth`.
- TanStack Query: `ensureQueryData` di loader rute publik, `useSuspenseQuery` di komponen. Loader protected hanya di bawah `_authenticated/`.
- Setiap route punya `head()` Bahasa Indonesia (title, description, og:title/description), produk & artikel pakai gambar utama sebagai `og:image`.
- Setiap route ber-loader punya `errorComponent` + `notFoundComponent`.

## Image assets

Generate via `imagegen` (fast): 6 hero origin (Gayo/Toraja/Kintamani/Java Preanger/Flores Bajawa/Papua), 12 foto produk default, 3 thumbnail blog, hero About, ilustrasi bean tambahan untuk wizard. Disimpan di `src/assets/`.

## Yang tidak dikerjakan di stage ini

Keranjang, checkout, voucher, ongkir, upload bukti, tracking, notifikasi → **Stage 2**.
Admin panel apapun → **Stage 3**.
Subscription, loyalty redeem, forum, recipe, event → **Stage 4**.

## Tech notes

- Tidak ada hardcoded hex di komponen — pakai CSS var atau token shadcn.
- Semua copy + toast Bahasa Indonesia, tone hangat + edukatif.
- Validasi form pakai Zod (trim, max length, email format).
- Tombol cart/wishlist tampil aktif visual tapi menampilkan toast “Fitur aktif di tahap berikutnya” supaya UX tidak terasa broken sebelum Stage 2.

Balas **"lanjut"** untuk mulai Stage 1, atau beri tahu jika ada halaman yang ingin diprioritaskan / dipangkas.
