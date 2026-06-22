
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid := auth.uid(); v_exists boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Tidak terautentikasi'; END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role='admin'::app_role) INTO v_exists;
  IF v_exists THEN RAISE EXCEPTION 'Admin sudah ada'; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (v_user, 'admin'::app_role) ON CONFLICT DO NOTHING;
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_user,'bootstrap_admin','user_roles',v_user::text,'{}'::jsonb);
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.admin_verify_payment(p_payment_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_admin, CASE WHEN p_approve THEN 'verify_payment' ELSE 'reject_payment' END,
            'payment', v_pay.id::text, jsonb_build_object('note',p_note));
  RETURN v_pay;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_shipment(p_order_id uuid, p_courier courier, p_tracking text)
RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_admin,'set_shipment','order',o.id::text,jsonb_build_object('courier',p_courier,'tracking',p_tracking));
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_order_status(p_order_id uuid, p_status order_status, p_note text DEFAULT NULL)
RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_admin,'set_order_status','order',o.id::text,jsonb_build_object('status',p_status,'note',p_note));
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.admin_refund_order(p_order_id uuid, p_reason text DEFAULT NULL)
RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_admin,'refund_order','order',o.id::text,jsonb_build_object('reason',p_reason));
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.admin_adjust_shipping(p_order_id uuid, p_new_shipping int)
RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_admin,'adjust_shipping','order',o.id::text,jsonb_build_object('shipping',p_new_shipping));
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role app_role, p_grant boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := auth.uid();
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_grant THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (p_user_id, p_role) ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id=p_user_id AND role=p_role;
  END IF;
  INSERT INTO public.activity_logs(user_id, action, entity, entity_id, meta)
    VALUES (v_admin, CASE WHEN p_grant THEN 'grant_role' ELSE 'revoke_role' END,
            'user_roles', p_user_id::text, jsonb_build_object('role',p_role));
  RETURN true;
END $$;
