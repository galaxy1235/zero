-- Phase 3: Checkout / Payment / Rental lifecycle. ราคาและสถานะคำนวณใน DB ฝั่ง Server เท่านั้น
alter table orders add column renews_subscription_id uuid references subscriptions(id);
alter table order_items add column plan_id text references pricing_plans(id);

create function create_order(p_user uuid, p_slug text, p_cycle billing_cycle, p_idem text) returns uuid
language plpgsql security definer set search_path = public as $$
declare tpl record; price int; oid uuid;
begin
  select id into oid from orders where user_id = p_user and idempotency_key = p_idem;
  if oid is not null then return oid; end if;
  select wt.id, wt.name, pp.id as plan_id, pp.name as plan_name, pp.monthly_price_thb as m, pp.yearly_price_thb as y into tpl
    from website_templates wt join pricing_plans pp on pp.id = wt.plan_id
    where wt.slug = p_slug and wt.is_active and wt.deleted_at is null and pp.is_active;
  if not found then raise exception 'template_unavailable'; end if;
  price := case when p_cycle = 'yearly' then tpl.y else tpl.m end;
  insert into orders (order_no, user_id, status, billing_cycle, subtotal_thb, total_thb, idempotency_key)
    values ('WR-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)), p_user, 'pending', p_cycle, price, price, p_idem)
    returning id into oid;
  insert into order_items (order_id, template_id, plan_id, template_name_snapshot, plan_name_snapshot, unit_price_thb) values (oid, tpl.id, tpl.plan_id, tpl.name, tpl.plan_name, price);
  return oid;
exception when unique_violation then
  select id into oid from orders where user_id = p_user and idempotency_key = p_idem;
  if oid is null then raise; end if;
  return oid;
end $$;

create function create_renewal_order(p_user uuid, p_site uuid, p_idem text) returns uuid
language plpgsql security definer set search_path = public as $$
declare s record; price int; oid uuid;
begin
  select id into oid from orders where user_id = p_user and idempotency_key = p_idem;
  if oid is not null then return oid; end if;
  select rw.template_id, rw.subscription_id, sub.billing_cycle as cyc, pp.id as plan_id, pp.name as plan_name, pp.monthly_price_thb as m, pp.yearly_price_thb as y, coalesce(wt.name, rw.site_name) as tname into s
    from rented_websites rw join subscriptions sub on sub.id = rw.subscription_id join pricing_plans pp on pp.id = sub.plan_id left join website_templates wt on wt.id = rw.template_id
    where rw.id = p_site and rw.user_id = p_user and sub.user_id = p_user and rw.deleted_at is null and rw.status in ('active', 'expired');
  if not found then raise exception 'site_not_renewable'; end if;
  price := case when s.cyc = 'yearly' then s.y else s.m end;  -- ต่ออายุตามราคาปัจจุบันของแพ็กเกจ
  insert into orders (order_no, user_id, status, billing_cycle, subtotal_thb, total_thb, idempotency_key, renews_subscription_id)
    values ('WR-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)), p_user, 'pending', s.cyc, price, price, p_idem, s.subscription_id)
    returning id into oid;
  insert into order_items (order_id, template_id, plan_id, template_name_snapshot, plan_name_snapshot, unit_price_thb) values (oid, s.template_id, s.plan_id, s.tname, s.plan_name, price);
  return oid;
exception when unique_violation then
  select id into oid from orders where user_id = p_user and idempotency_key = p_idem;
  if oid is null then raise; end if;
  return oid;
end $$;

-- เรียกจาก Webhook (หลังตรวจ Signature) เท่านั้น: idempotent, ตรวจยอดเงิน, สร้าง Subscription + Provision หรือขยายอายุ ในทรานแซกชันเดียว
create function fulfill_order(p_order uuid, p_provider text, p_ref text, p_amount int) returns text
language plpgsql security definer set search_path = public as $$
declare o orders%rowtype; it record; sid uuid; iv interval; base timestamptz; per_end timestamptz;
begin
  select * into o from orders where id = p_order for update;
  if not found then return 'order_not_found'; end if;
  if o.status = 'paid' then return 'already_paid'; end if;
  if o.status in ('cancelled', 'refunded') then return 'order_closed'; end if;
  if p_amount <> o.total_thb then
    insert into payments (order_id, provider, provider_ref, status, amount_thb) values (o.id, p_provider, p_ref, 'failed', p_amount) on conflict (provider, provider_ref) do nothing;
    return 'amount_mismatch';
  end if;
  insert into payments (order_id, provider, provider_ref, status, amount_thb) values (o.id, p_provider, p_ref, 'succeeded', p_amount) on conflict (provider, provider_ref) do nothing;
  update orders set status = 'paid' where id = o.id;
  iv := case when o.billing_cycle = 'yearly' then interval '1 year' else interval '1 month' end;
  if o.renews_subscription_id is not null then
    select greatest(now(), current_period_end) into base from subscriptions where id = o.renews_subscription_id and user_id = o.user_id for update;
    if base is null then raise exception 'subscription_not_found'; end if;
    per_end := base + iv;
    update subscriptions set current_period_end = per_end, status = 'active', cancel_at_period_end = false where id = o.renews_subscription_id;
    update rented_websites set expires_at = per_end, status = 'active' where subscription_id = o.renews_subscription_id and deleted_at is null and status in ('active', 'expired');
  else
    for it in select * from order_items where order_id = o.id loop
      if it.plan_id is null then raise exception 'missing_plan'; end if;
      insert into subscriptions (user_id, order_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
        values (o.user_id, o.id, it.plan_id, 'active', o.billing_cycle, now(), now() + iv) returning id into sid;
      insert into rented_websites (user_id, template_id, subscription_id, order_item_id, site_name, status, started_at, expires_at)
        values (o.user_id, it.template_id, sid, it.id, it.template_name_snapshot, 'active', now(), now() + iv) on conflict (order_item_id) do nothing;
    end loop;
  end if;
  return 'paid';
end $$;

create function mark_order_failed(p_order uuid, p_provider text, p_ref text, p_amount int) returns text
language plpgsql security definer set search_path = public as $$
declare o orders%rowtype;
begin
  select * into o from orders where id = p_order for update;
  if not found then return 'order_not_found'; end if;
  if o.status <> 'pending' then return 'ignored'; end if;  -- ไม่ลดสถานะ paid/cancelled
  insert into payments (order_id, provider, provider_ref, status, amount_thb) values (o.id, p_provider, p_ref, 'failed', p_amount) on conflict (provider, provider_ref) do nothing;
  update orders set status = 'failed' where id = o.id;
  return 'failed';
end $$;

create function expire_subscriptions() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update subscriptions set status = 'expired' where status = 'active' and current_period_end < now();
  get diagnostics n = row_count;
  update rented_websites rw set status = 'expired' from subscriptions s where rw.subscription_id = s.id and s.status = 'expired' and rw.status = 'active';
  return n;
end $$;

-- ฟังก์ชันที่ลูกค้าเรียกเองได้ (ตรวจ auth.uid() ภายใน)
create function cancel_pending_order(p_order uuid) returns void language sql security definer set search_path = public as $$
  update orders set status = 'cancelled' where id = p_order and user_id = auth.uid() and status in ('pending', 'failed') $$;
create function set_cancel_at_period_end(p_sub uuid, p_cancel boolean) returns void language sql security definer set search_path = public as $$
  update subscriptions set cancel_at_period_end = p_cancel where id = p_sub and user_id = auth.uid() and status = 'active' $$;

revoke all on function create_order(uuid, text, billing_cycle, text), create_renewal_order(uuid, uuid, text), fulfill_order(uuid, text, text, int), mark_order_failed(uuid, text, text, int), expire_subscriptions(), cancel_pending_order(uuid), set_cancel_at_period_end(uuid, boolean) from public, anon, authenticated;
grant execute on function create_order(uuid, text, billing_cycle, text), create_renewal_order(uuid, uuid, text), fulfill_order(uuid, text, text, int), mark_order_failed(uuid, text, text, int), expire_subscriptions() to service_role;
grant execute on function cancel_pending_order(uuid), set_cancel_at_period_end(uuid, boolean) to authenticated;
