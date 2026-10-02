create or replace function public.partner_customer_invoice(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  sid uuid;
  result jsonb;
  cfg jsonb;
  v_partner_subtotal numeric := 0;
  v_supplier_due numeric := 0;
  v_zemzem_margin numeric := 0;
  v_item_qty integer := 0;
  v_tracking text;
  v_carrier text;
begin
  if auth.uid() is null then raise exception 'LOGIN_REQUIRED'; end if;

  select s.id into sid
  from public.suppliers s
  where s.auth_user_id=auth.uid()
    and s.partner_status='approved'
    and s.partner_enabled=true;

  if sid is null then raise exception 'PARTNER_NOT_APPROVED'; end if;

  if not exists(
    select 1
    from public.order_items oi
    where oi.order_id=p_order_id
      and oi.supplier_id=sid
  ) then
    raise exception 'ORDER_NOT_AVAILABLE';
  end if;

  select
    coalesce(sum(coalesce(oi.line_total,oi.unit_price*oi.quantity)),0),
    coalesce(sum(coalesce(oi.supplier_cost,0)*oi.quantity),0),
    coalesce(sum(coalesce(oi.zemzem_margin,coalesce(oi.unit_price,0)-coalesce(oi.supplier_cost,0))*oi.quantity),0),
    coalesce(sum(oi.quantity),0)
  into v_partner_subtotal,v_supplier_due,v_zemzem_margin,v_item_qty
  from public.order_items oi
  where oi.order_id=p_order_id
    and oi.supplier_id=sid;

  select pf.tracking_number,pf.shipping_carrier
  into v_tracking,v_carrier
  from public.partner_order_fulfillments pf
  where pf.order_id=p_order_id
    and pf.supplier_id=sid
  limit 1;

  select value into cfg
  from public.site_runtime_settings
  where key='invoice'
  limit 1;

  select jsonb_build_object(
    'order',jsonb_build_object(
      'id',o.id,
      'order_number',o.order_number,
      'invoice_number',o.order_number,
      'created_at',o.created_at,
      'first_name',o.first_name,
      'last_name',o.last_name,
      'guest_email',o.guest_email,
      'phone',o.phone,
      'address_line1',o.address_line1,
      'address_line2',o.address_line2,
      'city',o.city,
      'postal_code',o.postal_code,
      'country_code',o.country_code,
      'payment_method',o.payment_method,
      'payment_status',o.payment_status,
      'order_status',o.order_status,
      'subtotal',round(v_partner_subtotal,2),
      'discount_amount',0,
      'payment_discount_amount',0,
      'shipping_amount',0,
      'cod_fee',0,
      'total',round(v_partner_subtotal,2),
      'currency',o.currency,
      'tracking_number',coalesce(v_tracking,o.tracking_number),
      'shipping_carrier',coalesce(v_carrier,o.shipping_carrier),
      'notes',o.notes,
      'source_order_total',o.total,
      'partner_item_qty',v_item_qty,
      'supplier_due',round(v_supplier_due,2),
      'zemzem_margin_total',round(v_zemzem_margin,2)
    ),
    'items',coalesce((
      select jsonb_agg(jsonb_build_object(
        'title',oi.title,
        'sku',oi.sku,
        'quantity',oi.quantity,
        'unit_price',oi.unit_price,
        'line_total',coalesce(oi.line_total,oi.unit_price*oi.quantity)
      ) order by oi.created_at)
      from public.order_items oi
      where oi.order_id=o.id
        and oi.supplier_id=sid
    ),'[]'::jsonb),
    'finance',jsonb_build_object(
      'supplier_due',round(v_supplier_due,2),
      'zemzem_margin_total',round(v_zemzem_margin,2),
      'gross_sales',round(v_partner_subtotal,2),
      'item_qty',v_item_qty
    ),
    'settings',coalesce(cfg,'{}'::jsonb)
  ) into result
  from public.orders o
  where o.id=p_order_id;

  if result is null then raise exception 'ORDER_NOT_FOUND'; end if;
  return result;
end
$function$;