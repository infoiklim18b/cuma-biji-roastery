
-- ============ store_settings ============
CREATE TABLE IF NOT EXISTS public.store_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  store_name text NOT NULL DEFAULT 'Cuma Biji',
  store_email text,
  store_phone text,
  store_address text,
  bank_accounts jsonb NOT NULL DEFAULT '[]'::jsonb,
  shipping_origin_city text DEFAULT 'Bandung',
  low_stock_threshold int NOT NULL DEFAULT 10,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_settings readable" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "admin can update store_settings" ON public.store_settings FOR UPDATE
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admin can insert store_settings" ON public.store_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

INSERT INTO public.store_settings (id, bank_accounts) VALUES (
  true,
  '[
    {"bank":"bca","number":"1234567890","holder":"PT Cuma Biji Indonesia"},
    {"bank":"mandiri","number":"1330001234567","holder":"PT Cuma Biji Indonesia"},
    {"bank":"bni","number":"0987654321","holder":"PT Cuma Biji Indonesia"},
    {"bank":"bri","number":"123401000456304","holder":"PT Cuma Biji Indonesia"}
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============ Admin RLS policies ============
DO $$ BEGIN
  CREATE POLICY "admin view all orders" ON public.orders FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin update all orders" ON public.orders FOR UPDATE
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin view all payments" ON public.payments FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin update all payments" ON public.payments FOR UPDATE
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin manage shipments" ON public.shipments FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin manage products" ON public.products FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin manage product images" ON public.product_images FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin manage origins" ON public.origins FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin manage categories" ON public.categories FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin manage blogs" ON public.blogs FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin manage blog_categories" ON public.blog_categories FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin manage coupons" ON public.coupons FOR ALL
    USING (public.has_role(auth.uid(),'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin view coupon redemptions" ON public.coupon_redemptions FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin view all order_items" ON public.order_items FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin moderate reviews" ON public.reviews FOR DELETE
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin view all profiles" ON public.profiles FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin view user_roles" ON public.user_roles FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin view activity logs" ON public.activity_logs FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin view addresses" ON public.addresses FOR SELECT
    USING (public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ Admin RPCs ============

-- Bootstrap: promote caller to admin only if no admin exists yet
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_user uuid := auth.uid(); v_exists boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Tidak terautentikasi'; END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role='admin'::app_role) INTO v_exists;
  IF v_exists THEN RAISE EXCEPTION 'Admin sudah ada'; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (v_user, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_user, 'bootstrap_admin', 'user_roles', v_user::text, '{}'::jsonb);
  RETURN true;
END $$;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;

-- Verify (approve/reject) payment proof
CREATE OR REPLACE FUNCTION public.admin_verify_payment(p_payment_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid(); v_pay public.payments; v_order public.orders;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.payments
    SET status = CASE WHEN p_approve THEN 'diverifikasi'::payment_status ELSE 'ditolak'::payment_status END,
        verified_at = now(), verified_by = v_admin, admin_note = p_note, updated_at = now()
    WHERE id = p_payment_id RETURNING * INTO v_pay;
  IF v_pay.id IS NULL THEN RAISE EXCEPTION 'Pembayaran tidak ditemukan'; END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = v_pay.order_id;
  IF p_approve THEN
    UPDATE public.orders SET status='diproses'::order_status, updated_at=now() WHERE id=v_order.id;
    INSERT INTO public.notifications(user_id,type,title,body,link)
      VALUES (v_order.user_id,'payment'::notif_type,'Pembayaran terverifikasi',
              'Pembayaran pesanan '||v_order.order_number||' sudah kami terima. Pesanan diproses ☕',
              '/akun/pesanan/'||v_order.order_number);
  ELSE
    UPDATE public.orders SET status='menunggu_pembayaran'::order_status, updated_at=now() WHERE id=v_order.id;
    INSERT INTO public.notifications(user_id,type,title,body,link)
      VALUES (v_order.user_id,'payment'::notif_type,'Bukti pembayaran ditolak',
              COALESCE(p_note,'Mohon upload ulang bukti transfer yang benar.'),
              '/akun/pesanan/'||v_order.order_number||'/bayar');
  END IF;
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_admin, CASE WHEN p_approve THEN 'verify_payment' ELSE 'reject_payment' END,
            'payment', v_pay.id::text, jsonb_build_object('note',p_note));
  RETURN v_pay;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_verify_payment(uuid,boolean,text) TO authenticated;

-- Set shipment (courier + tracking) -> dikirim
CREATE OR REPLACE FUNCTION public.admin_set_shipment(p_order_id uuid, p_courier courier, p_tracking text)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid(); o public.orders;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.shipments SET courier=p_courier, tracking_number=p_tracking, shipped_at=now(), updated_at=now()
    WHERE order_id=p_order_id;
  IF NOT FOUND THEN
    INSERT INTO public.shipments(order_id, courier, tracking_number, shipped_at)
      VALUES (p_order_id, p_courier, p_tracking, now());
  END IF;
  UPDATE public.orders SET status='dikirim'::order_status, courier=p_courier, updated_at=now()
    WHERE id=p_order_id RETURNING * INTO o;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  INSERT INTO public.notifications(user_id,type,title,body,link)
    VALUES (o.user_id,'shipment'::notif_type,'Pesanan dikirim',
            'Pesanan '||o.order_number||' sudah dikirim via '||p_courier||' (resi '||p_tracking||')',
            '/akun/pesanan/'||o.order_number);
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_admin,'set_shipment','order',o.id::text,jsonb_build_object('courier',p_courier,'tracking',p_tracking));
  RETURN o;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_shipment(uuid,courier,text) TO authenticated;

-- Generic admin status change
CREATE OR REPLACE FUNCTION public.admin_set_order_status(p_order_id uuid, p_status order_status, p_note text DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid(); o public.orders;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.orders SET status=p_status, updated_at=now(),
    completed_at = CASE WHEN p_status='selesai'::order_status THEN now() ELSE completed_at END
    WHERE id=p_order_id RETURNING * INTO o;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  INSERT INTO public.notifications(user_id,type,title,body,link)
    VALUES (o.user_id,'order'::notif_type,'Status pesanan diperbarui',
            'Pesanan '||o.order_number||' kini berstatus '||p_status::text||COALESCE('. '||p_note,''),
            '/akun/pesanan/'||o.order_number);
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_admin,'set_order_status','order',o.id::text,jsonb_build_object('status',p_status,'note',p_note));
  RETURN o;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_order_status(uuid,order_status,text) TO authenticated;

-- Refund: restore stock, mark refund
CREATE OR REPLACE FUNCTION public.admin_refund_order(p_order_id uuid, p_reason text DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid(); o public.orders;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.orders SET status='refund'::order_status, cancel_reason=p_reason, updated_at=now()
    WHERE id=p_order_id RETURNING * INTO o;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  UPDATE public.products p SET stock=stock+oi.qty
    FROM public.order_items oi WHERE oi.order_id=o.id AND oi.product_id=p.id;
  UPDATE public.payments SET status='refund'::payment_status, updated_at=now() WHERE order_id=o.id;
  INSERT INTO public.notifications(user_id,type,title,body,link)
    VALUES (o.user_id,'order'::notif_type,'Pesanan direfund',
            'Pesanan '||o.order_number||' direfund. '||COALESCE(p_reason,''),
            '/akun/pesanan/'||o.order_number);
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_admin,'refund_order','order',o.id::text,jsonb_build_object('reason',p_reason));
  RETURN o;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_refund_order(uuid,text) TO authenticated;

-- Adjust shipping cost (admin recalculates total)
CREATE OR REPLACE FUNCTION public.admin_adjust_shipping(p_order_id uuid, p_new_shipping int)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid(); o public.orders; v_suffix int;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT * INTO o FROM public.orders WHERE id=p_order_id;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak ditemukan'; END IF;
  v_suffix := o.total % 1000;
  UPDATE public.orders
    SET shipping_cost=p_new_shipping,
        total = (o.subtotal - o.discount + p_new_shipping) - ((o.subtotal - o.discount + p_new_shipping) % 1000) + v_suffix,
        updated_at=now()
    WHERE id=p_order_id RETURNING * INTO o;
  UPDATE public.payments SET amount=o.total, updated_at=now() WHERE order_id=o.id AND status='menunggu'::payment_status;
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_admin,'adjust_shipping','order',o.id::text,jsonb_build_object('shipping',p_new_shipping));
  RETURN o;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_adjust_shipping(uuid,int) TO authenticated;

-- Grant/revoke roles
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role app_role, p_grant boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid();
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_grant THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (p_user_id, p_role) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id=p_user_id AND role=p_role;
  END IF;
  INSERT INTO public.activity_logs(actor_id, action, target_type, target_id, meta)
    VALUES (v_admin, CASE WHEN p_grant THEN 'grant_role' ELSE 'revoke_role' END,
            'user_roles', p_user_id::text, jsonb_build_object('role',p_role));
  RETURN true;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,app_role,boolean) TO authenticated;

-- Dashboard metrics aggregate
CREATE OR REPLACE FUNCTION public.admin_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_admin uuid := auth.uid(); v_result jsonb;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT jsonb_build_object(
    'revenue_today', COALESCE((SELECT SUM(total) FROM public.orders WHERE status IN ('diproses','dikirim','selesai') AND created_at >= date_trunc('day',now())),0),
    'revenue_7d', COALESCE((SELECT SUM(total) FROM public.orders WHERE status IN ('diproses','dikirim','selesai') AND created_at >= now() - interval '7 days'),0),
    'revenue_30d', COALESCE((SELECT SUM(total) FROM public.orders WHERE status IN ('diproses','dikirim','selesai') AND created_at >= now() - interval '30 days'),0),
    'orders_count', (SELECT COUNT(*) FROM public.orders),
    'orders_by_status', (SELECT jsonb_object_agg(status::text, c) FROM (SELECT status, COUNT(*) c FROM public.orders GROUP BY status) s),
    'pending_verification', (SELECT COUNT(*) FROM public.payments WHERE status='menunggu_verifikasi'::payment_status OR (status='menunggu'::payment_status AND proof_url IS NOT NULL)),
    'low_stock', (SELECT COUNT(*) FROM public.products WHERE is_published=true AND stock <= (SELECT low_stock_threshold FROM public.store_settings WHERE id=true)),
    'new_customers_7d', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= now() - interval '7 days'),
    'revenue_series_30d', (
      SELECT jsonb_agg(jsonb_build_object('day', d::date, 'revenue', COALESCE(r,0)) ORDER BY d)
      FROM generate_series(date_trunc('day',now()) - interval '29 days', date_trunc('day',now()), interval '1 day') d
      LEFT JOIN (
        SELECT date_trunc('day',created_at) dd, SUM(total) r
        FROM public.orders WHERE status IN ('diproses','dikirim','selesai') AND created_at >= now() - interval '30 days'
        GROUP BY 1
      ) x ON x.dd = d
    ),
    'top_products', (
      SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT p.id, p.name, p.thumbnail, SUM(oi.qty) AS sold, SUM(oi.subtotal) AS revenue
        FROM public.order_items oi JOIN public.products p ON p.id=oi.product_id
        JOIN public.orders o ON o.id=oi.order_id
        WHERE o.status IN ('diproses','dikirim','selesai') AND o.created_at >= now() - interval '30 days'
        GROUP BY p.id ORDER BY revenue DESC LIMIT 5
      ) t
    )
  ) INTO v_result;
  RETURN v_result;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_metrics() TO authenticated;

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_products_published_kind ON public.products(is_published, kind);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ============ Storage policies ============
DO $$ BEGIN
  CREATE POLICY "admin upload product-images" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id='product-images' AND public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin update product-images" ON storage.objects FOR UPDATE
    USING (bucket_id='product-images' AND public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin delete product-images" ON storage.objects FOR DELETE
    USING (bucket_id='product-images' AND public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public read product-images" ON storage.objects FOR SELECT
    USING (bucket_id='product-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "admin upload blog-images" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id='blog-images' AND public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin update blog-images" ON storage.objects FOR UPDATE
    USING (bucket_id='blog-images' AND public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin delete blog-images" ON storage.objects FOR DELETE
    USING (bucket_id='blog-images' AND public.has_role(auth.uid(),'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public read blog-images" ON storage.objects FOR SELECT
    USING (bucket_id='blog-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "user upload own avatar" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "user update own avatar" ON storage.objects FOR UPDATE
    USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "public read avatars" ON storage.objects FOR SELECT
    USING (bucket_id='avatars');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
