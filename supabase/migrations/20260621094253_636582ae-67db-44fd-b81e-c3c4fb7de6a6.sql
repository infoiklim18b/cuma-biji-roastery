
-- Customer-driven order state transitions
CREATE OR REPLACE FUNCTION public.cancel_my_order(p_order_id uuid, p_reason text DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE o public.orders;
BEGIN
  UPDATE public.orders
    SET status='dibatalkan'::order_status, cancel_reason = COALESCE(p_reason,'Dibatalkan oleh pembeli'), updated_at=now()
    WHERE id=p_order_id AND user_id=auth.uid() AND status='menunggu_pembayaran'::order_status
    RETURNING * INTO o;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak dapat dibatalkan'; END IF;
  -- restore stock
  UPDATE public.products p SET stock = stock + oi.qty
    FROM public.order_items oi
    WHERE oi.order_id = o.id AND oi.product_id = p.id;
  -- mark payment rejected
  UPDATE public.payments SET status='ditolak'::payment_status, updated_at=now()
    WHERE order_id=o.id AND status='menunggu'::payment_status;
  INSERT INTO public.notifications(user_id,type,title,body,link)
    VALUES (auth.uid(),'order'::notif_type,'Pesanan dibatalkan','Pesanan '||o.order_number||' telah dibatalkan.','/akun/pesanan/'||o.order_number);
  RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.mark_order_received(p_order_id uuid)
RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE o public.orders;
BEGIN
  UPDATE public.orders
    SET status='selesai'::order_status, completed_at=now(), updated_at=now()
    WHERE id=p_order_id AND user_id=auth.uid() AND status='dikirim'::order_status
    RETURNING * INTO o;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Pesanan tidak dalam status dikirim'; END IF;
  INSERT INTO public.notifications(user_id,type,title,body,link)
    VALUES (auth.uid(),'order'::notif_type,'Pesanan selesai','Terima kasih sudah menerima pesanan '||o.order_number||'. Yuk tulis ulasan ☕','/akun/pesanan/'||o.order_number);
  RETURN o;
END $$;

GRANT EXECUTE ON FUNCTION public.cancel_my_order(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_order_received(uuid) TO authenticated;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
