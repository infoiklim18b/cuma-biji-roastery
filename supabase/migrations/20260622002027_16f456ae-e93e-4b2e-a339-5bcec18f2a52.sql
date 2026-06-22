
CREATE OR REPLACE FUNCTION public.admin_verify_payment(p_payment_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := auth.uid(); v_pay public.payments; v_order public.orders;
BEGIN
  IF NOT public.has_role(v_admin,'admin'::app_role) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.payments
    SET status = CASE WHEN p_approve THEN 'diverifikasi'::payment_status ELSE 'ditolak'::payment_status END,
        verified_at = now(), verified_by = v_admin,
        reject_reason = CASE WHEN p_approve THEN NULL ELSE p_note END,
        updated_at = now()
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
