
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');
CREATE TYPE public.roast_level AS ENUM ('light', 'medium', 'medium_dark', 'dark');
CREATE TYPE public.process_method AS ENUM ('washed', 'natural', 'honey', 'wet_hulled', 'anaerobic');
CREATE TYPE public.grind_size AS ENUM ('whole_bean', 'espresso', 'v60', 'kalita', 'moka_pot', 'french_press', 'tubruk');
CREATE TYPE public.product_kind AS ENUM ('single_origin', 'blend', 'accessory', 'custom');
CREATE TYPE public.order_status AS ENUM ('menunggu_pembayaran','menunggu_verifikasi','diproses','dikirim','selesai','dibatalkan','refund');
CREATE TYPE public.payment_status AS ENUM ('menunggu','diverifikasi','ditolak','refund');
CREATE TYPE public.courier AS ENUM ('jne','jnt','sicepat','anteraja');
CREATE TYPE public.bank AS ENUM ('bca','mandiri','bni','bri');
CREATE TYPE public.blog_status AS ENUM ('draft','published');
CREATE TYPE public.coupon_type AS ENUM ('percent','amount','free_shipping');
CREATE TYPE public.subscription_tier AS ENUM ('explorer','nusantara','premium');
CREATE TYPE public.subscription_status AS ENUM ('active','paused','cancelled');
CREATE TYPE public.notif_type AS ENUM ('order','payment','shipping','promo','system');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ADDRESSES ============
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  recipient TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY "admins read addresses" ON public.addresses FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER addresses_updated BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ORIGINS ============
CREATE TABLE public.origins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  altitude TEXT,
  description TEXT,
  hero_image TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.origins TO anon, authenticated;
GRANT ALL ON public.origins TO service_role;
ALTER TABLE public.origins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "origins public read" ON public.origins FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage origins" ON public.origins FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  kind public.product_kind NOT NULL DEFAULT 'single_origin',
  origin_id UUID REFERENCES public.origins(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(12,2) NOT NULL,
  compare_price NUMERIC(12,2),
  stock INT NOT NULL DEFAULT 0,
  weight_g INT,
  roast_level public.roast_level,
  process public.process_method,
  tasting_notes TEXT[],
  aroma SMALLINT,
  body SMALLINT,
  acidity SMALLINT,
  thumbnail TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sold_count INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (is_published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCT IMAGES ============
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product images public read" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CART ============
CREATE TABLE public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_code TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart TO authenticated;
GRANT ALL ON public.cart TO service_role;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.cart FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER cart_updated BEFORE UPDATE ON public.cart FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.cart(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  custom_config JSONB,
  name_snapshot TEXT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  grind public.grind_size,
  weight_g INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart items" ON public.cart_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.cart c WHERE c.id = cart_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.cart c WHERE c.id = cart_id AND c.user_id = auth.uid()));

-- ============ ORDERS ============
CREATE SEQUENCE IF NOT EXISTS public.order_seq START 1;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status public.order_status NOT NULL DEFAULT 'menunggu_pembayaran',
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  voucher_code TEXT,
  note TEXT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_street TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  recipient_province TEXT NOT NULL,
  recipient_postal_code TEXT NOT NULL,
  courier public.courier NOT NULL,
  bank public.bank NOT NULL,
  tracking_number TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto order number CBJ-YYYY-NNNNNN
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'CBJ-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.order_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER orders_set_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  custom_config JSONB,
  name_snapshot TEXT NOT NULL,
  thumbnail TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  qty INT NOT NULL,
  grind public.grind_size,
  weight_g INT,
  subtotal NUMERIC(12,2) NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "own order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=auth.uid()));

-- ============ PAYMENTS / PROOFS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  bank public.bank NOT NULL,
  sender_name TEXT,
  proof_url TEXT,
  status public.payment_status NOT NULL DEFAULT 'menunggu',
  reject_reason TEXT,
  note TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "own payments insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own payments update" ON public.payments FOR UPDATE TO authenticated USING (auth.uid()=user_id AND status='menunggu');
CREATE POLICY "admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SHIPMENTS ============
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  courier public.courier NOT NULL,
  tracking_number TEXT,
  estimated_arrival DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shipment read" ON public.shipments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "admins manage shipments" ON public.shipments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER shipments_updated BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WISHLIST ============
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist" ON public.wishlist FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews insert own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  auth.uid()=user_id AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=auth.uid() AND o.status='selesai')
);
CREATE POLICY "reviews update own" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "reviews delete own" ON public.reviews FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  url TEXT NOT NULL
);
GRANT SELECT ON public.review_photos TO anon, authenticated;
GRANT INSERT, DELETE ON public.review_photos TO authenticated;
GRANT ALL ON public.review_photos TO service_role;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review photos public read" ON public.review_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "review photos own" ON public.review_photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reviews r WHERE r.id=review_id AND r.user_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.reviews r WHERE r.id=review_id AND r.user_id=auth.uid()));

-- ============ BLOG ============
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog cats public read" ON public.blog_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage blog cats" ON public.blog_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  thumbnail TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.blog_status NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blogs TO anon, authenticated;
GRANT ALL ON public.blogs TO service_role;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blogs public read" ON public.blogs FOR SELECT TO anon, authenticated USING (status='published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blogs_updated BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ COUPONS ============
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type public.coupon_type NOT NULL,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons read active" ON public.coupons FOR SELECT TO authenticated USING (is_active=true);
CREATE POLICY "admins manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own redemptions" ON public.coupon_redemptions FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own redemptions insert" ON public.coupon_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notif_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifs" ON public.notifications FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "own notifs update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid()=user_id);

-- ============ LOYALTY ============
CREATE TABLE public.loyalty_points (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  lifetime INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.loyalty_points TO authenticated;
GRANT ALL ON public.loyalty_points TO service_role;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty" ON public.loyalty_points FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "admins read loyalty" ON public.loyalty_points FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.loyalty_transactions TO authenticated;
GRANT ALL ON public.loyalty_transactions TO service_role;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loyalty tx" ON public.loyalty_transactions FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.subscription_tier NOT NULL,
  status public.subscription_status NOT NULL DEFAULT 'active',
  cadence_weeks INT NOT NULL DEFAULT 4,
  next_ship_at DATE,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subs" ON public.subscriptions FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE POLICY "admins read subs" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.subscription_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ship_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_deliveries TO authenticated;
GRANT ALL ON public.subscription_deliveries TO service_role;
ALTER TABLE public.subscription_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sub deliveries" ON public.subscription_deliveries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.id=subscription_id AND (s.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));

-- ============ COMMUNITY ============
CREATE TABLE public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forum_threads TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_threads TO authenticated;
GRANT ALL ON public.forum_threads TO service_role;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads public read" ON public.forum_threads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "threads author write" ON public.forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid()=author_id);
CREATE POLICY "threads author update" ON public.forum_threads FOR UPDATE TO authenticated USING (auth.uid()=author_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "threads author delete" ON public.forum_threads FOR DELETE TO authenticated USING (auth.uid()=author_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER threads_updated BEFORE UPDATE ON public.forum_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forum_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_posts TO authenticated;
GRANT ALL ON public.forum_posts TO service_role;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.forum_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "posts author write" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid()=author_id);
CREATE POLICY "posts author update" ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid()=author_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "posts author delete" ON public.forum_posts FOR DELETE TO authenticated USING (auth.uid()=author_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  method public.grind_size,
  body TEXT,
  thumbnail TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.recipes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes public read" ON public.recipes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "recipes author write" ON public.recipes FOR INSERT TO authenticated WITH CHECK (auth.uid()=author_id);
CREATE POLICY "recipes author update" ON public.recipes FOR UPDATE TO authenticated USING (auth.uid()=author_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "recipes author delete" ON public.recipes FOR DELETE TO authenticated USING (auth.uid()=author_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ACTIVITY LOG ============
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ STORAGE POLICIES ============
-- product-images, blog-images: public read, admin write
CREATE POLICY "product-images read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='product-images');
CREATE POLICY "product-images admin write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id='product-images' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id='product-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "blog-images read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='blog-images');
CREATE POLICY "blog-images admin write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id='blog-images' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id='blog-images' AND public.has_role(auth.uid(),'admin'));

-- avatars: user folder = auth.uid()
CREATE POLICY "avatars read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='avatars');
CREATE POLICY "avatars own write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- review-photos: read public, user folder write
CREATE POLICY "review-photos read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id='review-photos');
CREATE POLICY "review-photos own write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "review-photos own delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- payment-proofs: private, user folder write, admin read all
CREATE POLICY "payment-proofs own read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "payment-proofs own write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "payment-proofs own update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
