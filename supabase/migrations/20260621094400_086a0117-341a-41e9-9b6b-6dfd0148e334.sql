
REVOKE EXECUTE ON FUNCTION public.cancel_my_order(uuid,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_order_received(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.place_order(uuid,courier,bank,int,text,text) FROM PUBLIC, anon;
