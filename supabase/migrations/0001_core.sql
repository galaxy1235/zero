-- WebRent core schema (Phase 2). รันใน Supabase SQL Editor หรือ supabase db push
create extension if not exists pgcrypto;
create type app_role as enum ('customer','admin');
create type billing_cycle as enum ('monthly','yearly');
create type order_status as enum ('pending','paid','failed','cancelled','refunded');
create type payment_status as enum ('pending','succeeded','failed','refunded');
create type subscription_status as enum ('active','past_due','cancelled','expired');
create type site_status as enum ('provisioning','active','suspended','expired');

create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', phone text, business_name text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create table user_roles (
  user_id uuid not null references auth.users(id) on delete cascade, role app_role not null,
  primary key (user_id, role));

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin') $$;

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  insert into user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create table website_categories (id text primary key, name text not null, sort_order int not null default 0, is_active boolean not null default true);
create table pricing_plans (
  id text primary key, name text not null, monthly_price_thb int not null check (monthly_price_thb >= 0),
  yearly_price_thb int not null check (yearly_price_thb >= 0), max_sites int not null, storage_gb int not null,
  custom_domain boolean not null default false, support_level text not null, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table website_templates (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, tagline text not null default '',
  category_id text not null references website_categories(id), business_type text not null default '',
  plan_id text not null references pricing_plans(id), popularity int not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create index on website_templates (category_id);

create table orders (
  id uuid primary key default gen_random_uuid(), order_no text not null unique,
  user_id uuid not null references auth.users(id), status order_status not null default 'pending',
  billing_cycle billing_cycle not null, currency text not null default 'THB',
  subtotal_thb int not null, discount_thb int not null default 0, tax_thb int not null default 0, total_thb int not null,
  idempotency_key text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key));
create index on orders (user_id, created_at desc);
create table order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id) on delete cascade,
  template_id uuid references website_templates(id) on delete set null,
  template_name_snapshot text not null, plan_name_snapshot text not null, unit_price_thb int not null);  -- snapshot: ประวัติไม่เปลี่ยนตามราคาปัจจุบัน
create index on order_items (order_id);
create table payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references orders(id),
  provider text not null, provider_ref text not null, status payment_status not null default 'pending',
  amount_thb int not null, created_at timestamptz not null default now(), unique (provider, provider_ref));
create index on payments (order_id);
create table subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  order_id uuid references orders(id), plan_id text not null references pricing_plans(id),
  status subscription_status not null default 'active', billing_cycle billing_cycle not null,
  current_period_start timestamptz not null, current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on subscriptions (user_id);
create table rented_websites (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
  template_id uuid references website_templates(id), subscription_id uuid references subscriptions(id),
  order_item_id uuid unique references order_items(id),  -- unique = Provision ซ้ำไม่ได้ (idempotent)
  site_name text not null, status site_status not null default 'provisioning',
  started_at timestamptz, expires_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz);
create index on rented_websites (user_id, expires_at);

do $$ declare t text; begin
  foreach t in array array['profiles','pricing_plans','website_templates','orders','subscriptions','rented_websites'] loop
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
  foreach t in array array['profiles','user_roles','website_categories','pricing_plans','website_templates','orders','order_items','payments','subscriptions','rented_websites'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- RLS: ลูกค้าอ่านได้เฉพาะของตนเอง; เขียน orders/payments/subscriptions/rented_websites ผ่าน server (service role) เท่านั้น
create policy profiles_select on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy roles_select on user_roles for select using (user_id = auth.uid() or is_admin());  -- ไม่มี policy เขียน = ลูกค้าแก้สิทธิ์ตัวเองไม่ได้
create policy categories_read on website_categories for select using (is_active or is_admin());
create policy plans_read on pricing_plans for select using (is_active or is_admin());
create policy templates_read on website_templates for select using ((is_active and deleted_at is null) or is_admin());
create policy categories_admin on website_categories for all using (is_admin()) with check (is_admin());
create policy plans_admin on pricing_plans for all using (is_admin()) with check (is_admin());
create policy templates_admin on website_templates for all using (is_admin()) with check (is_admin());
create policy orders_select on orders for select using (user_id = auth.uid() or is_admin());
create policy items_select on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy payments_select on payments for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy subs_select on subscriptions for select using (user_id = auth.uid() or is_admin());
create policy sites_select on rented_websites for select using ((user_id = auth.uid() and deleted_at is null) or is_admin());
