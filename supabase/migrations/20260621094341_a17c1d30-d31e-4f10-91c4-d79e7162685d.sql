
CREATE OR REPLACE FUNCTION public.place_order(
  p_address_id uuid,
  p_courier courier,
  p_bank bank,
  p_shipping_cost int,
  p_voucher_code text,
  p_note text
) RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_cart public.cart;
  v_addr public.addresses;
  v_subtotal int := 0;
  v_discount int := 0;
  v_total int;
  v_coupon public.coupons;
  v_order public.orders;
  v_suffix int;
  v_item record;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Tidak terautentikasi'; END IF;
  SELECT * INTO v_addr FROM public.addresses WHERE id=p_address_id AND user_id=v_user;
  IF v_addr.id IS NULL THEN RAISE EXCEPTION 'Alamat tidak valid'; END IF;
  SELECT * INTO v_cart FROM public.cart WHERE user_id=v_user;
  IF v_cart.id IS NULL THEN RAISE EXCEPTION 'Keranjang kosong'; END IF;

  -- Lock stock and compute subtotal
  FOR v_item IN
    SELECT ci.*, p.stock AS p_stock
    FROM public.cart_items ci LEFT JOIN public.products p ON p.id=ci.product_id
    WHERE ci.cart_id=v_cart.id
    FOR UPDATE OF p
  LOOP
    IF v_item.product_id IS NOT NULL AND v_item.p_stock < v_item.qty THEN
      RAISE EXCEPTION 'Stok % tidak cukup', v_item.name_snapshot;
    END IF;
    v_subtotal := v_subtotal + v_item.unit_price * v_item.qty;
  END LOOP;

  IF v_subtotal <= 0 THEN RAISE EXCEPTION 'Keranjang kosong'; END IF;

  -- Voucher
  IF p_voucher_code IS NOT NULL AND length(trim(p_voucher_code)) > 0 THEN
    SELECT * INTO v_coupon FROM public.coupons
      WHERE upper(code)=upper(trim(p_voucher_code)) AND is_active=true
        AND (starts_at IS NULL OR starts_at <= now())
        AND (expires_at IS NULL OR expires_at >= now())
        AND (max_uses IS NULL OR used_count < max_uses)
        AND v_subtotal >= min_subtotal;
    IF v_coupon.id IS NULL THEN RAISE EXCEPTION 'Voucher tidak valid'; END IF;
    IF v_coupon.type = 'percent' THEN v_discount := (v_subtotal * v_coupon.value) / 100;
    ELSIF v_coupon.type = 'amount' THEN v_discount := LEAST(v_coupon.value, v_subtotal);
    ELSIF v_coupon.type = 'free_shipping' THEN v_discount := p_shipping_cost;
    END IF;
  END IF;

  v_suffix := floor(random()*900 + 100)::int;
  v_total := v_subtotal - v_discount + COALESCE(p_shipping_cost,0);
  v_total := v_total - (v_total % 1000) + v_suffix;

  INSERT INTO public.orders(
    user_id, status, courier, bank, subtotal, discount, shipping_cost, total,
    voucher_code, note,
    recipient_name, recipient_phone, recipient_street, recipient_city, recipient_province, recipient_postal_code
  ) VALUES (
    v_user, 'menunggu_pembayaran'::order_status, p_courier, p_bank,
    v_subtotal, v_discount, COALESCE(p_shipping_cost,0), v_total,
    CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.code ELSE NULL END,
    p_note,
    v_addr.recipient, v_addr.phone, v_addr.street, v_addr.city, v_addr.province, v_addr.postal_code
  ) RETURNING * INTO v_order;

  -- snapshot items + decrement stock
  INSERT INTO public.order_items(order_id, product_id, name_snapshot, qty, unit_price, subtotal, weight_g, grind, custom_config, thumbnail)
    SELECT v_order.id, ci.product_id, ci.name_snapshot, ci.qty, ci.unit_price, ci.unit_price*ci.qty, ci.weight_g, ci.grind, ci.custom_config, p.thumbnail
    FROM public.cart_items ci LEFT JOIN public.products p ON p.id=ci.product_id
    WHERE ci.cart_id=v_cart.id;

  UPDATE public.products p SET stock = stock - ci.qty, sold_count = sold_count + ci.qty
    FROM public.cart_items ci
    WHERE ci.cart_id=v_cart.id AND ci.product_id=p.id;

  INSERT INTO public.payments(order_id, user_id, bank, amount, status)
    VALUES (v_order.id, v_user, p_bank, v_total, 'menunggu'::payment_status);

  INSERT INTO public.shipments(order_id, courier) VALUES (v_order.id, p_courier);

  IF v_coupon.id IS NOT NULL THEN
    INSERT INTO public.coupon_redemptions(coupon_id, user_id, order_id, amount)
      VALUES (v_coupon.id, v_user, v_order.id, v_discount);
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id=v_coupon.id;
  END IF;

  DELETE FROM public.cart_items WHERE cart_id=v_cart.id;
  UPDATE public.cart SET voucher_code=NULL, note=NULL, updated_at=now() WHERE id=v_cart.id;

  INSERT INTO public.notifications(user_id,type,title,body,link)
    VALUES (v_user,'order'::notif_type,'Pesanan dibuat','Pesanan '||v_order.order_number||' menunggu pembayaran.','/akun/pesanan/'||v_order.order_number);

  RETURN v_order;
END $$;

GRANT EXECUTE ON FUNCTION public.place_order(uuid,courier,bank,int,text,text) TO authenticated;

-- ensure each user has exactly one cart (helper for upsert)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_cart_user ON public.cart(user_id);
