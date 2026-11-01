-- DEMO ONLY: ห้ามรันบน Production
insert into website_categories (id, name, sort_order) values
 ('shop','ร้านค้าออนไลน์',1),('service','ธุรกิจบริการ',2),('portfolio','Portfolio',3),('food','ร้านอาหาร',4),
 ('gaming','Gaming',5),('education','Education',6),('agency','Agency',7),('landing','Landing Page',8);
insert into pricing_plans (id,name,monthly_price_thb,yearly_price_thb,max_sites,storage_gb,custom_domain,support_level) values
 ('starter','Starter',299,2990,1,2,false,'อีเมล'),('business','Business',599,5990,3,10,true,'แชต (วันทำการ)'),('premium','Premium',1199,11990,10,50,true,'แชตด่วน');
insert into website_templates (slug,name,tagline,category_id,business_type,plan_id,popularity) values
 ('shoply','Shoply','ร้านแฟชั่นออนไลน์พร้อมขาย','shop','แฟชั่น','business',98),
 ('clinica','Clinica','คลินิกและสปา จองคิวง่าย','service','ความงาม/สุขภาพ','business',84),
 ('folio','Folio','แสดงผลงานสำหรับฟรีแลนซ์','portfolio','ฟรีแลนซ์','starter',76),
 ('tasty','Tasty','คาเฟ่และร้านอาหาร','food','คาเฟ่','starter',90),
 ('arena','Arena','ทีมอีสปอร์ตและคอมมูนิตี้','gaming','อีสปอร์ต','business',71),
 ('learnly','Learnly','ขายคอร์สออนไลน์','education','คอร์สออนไลน์','premium',88),
 ('pixelworks','Pixelworks','เอเจนซี่ดิจิทัล','agency','การตลาด/ครีเอทีฟ','premium',80),
 ('launchpad','Launchpad','Landing Page เปิดตัวสินค้า','landing','สตาร์ทอัพ','starter',93);

-- สร้างออเดอร์/เว็บที่เช่าตัวอย่าง (ใช้งาน / ใกล้หมดอายุ / หมดอายุ) ให้ผู้ใช้ทดสอบ: select seed_demo_for_user('<user-uuid>');
create or replace function seed_demo_for_user(uid uuid) returns void language plpgsql as $$
declare r record; i int := 0; t_id uuid; tn text; pn text; p int; pl text; o_id uuid; oi_id uuid; s_id uuid; st site_status;
begin
  for r in select * from (values ('shoply',60),('tasty',5),('folio',-10)) as v(slug, days_left) loop
    i := i + 1;
    select t.id, t.name, pl2.name, pl2.monthly_price_thb, pl2.id into t_id, tn, pn, p, pl
      from website_templates t join pricing_plans pl2 on pl2.id = t.plan_id where t.slug = r.slug;
    st := case when r.days_left < 0 then 'expired' else 'active' end;
    insert into orders (order_no,user_id,status,billing_cycle,subtotal_thb,total_thb,idempotency_key)
      values ('DEMO-' || lpad(i::text,4,'0'), uid, 'paid', 'monthly', p, p, 'demo-' || i || '-' || uid) returning id into o_id;
    insert into order_items (order_id,template_id,template_name_snapshot,plan_name_snapshot,unit_price_thb) values (o_id,t_id,tn,pn,p) returning id into oi_id;
    insert into payments (order_id,provider,provider_ref,status,amount_thb) values (o_id,'mock','DEMO-' || i || '-' || uid,'succeeded',p);
    insert into subscriptions (user_id,order_id,plan_id,status,billing_cycle,current_period_start,current_period_end)
      values (uid,o_id,pl, case when r.days_left < 0 then 'expired'::subscription_status else 'active'::subscription_status end,'monthly', now() + ((r.days_left - 30) || ' days')::interval, now() + (r.days_left || ' days')::interval) returning id into s_id;
    insert into rented_websites (user_id,template_id,subscription_id,order_item_id,site_name,status,started_at,expires_at)
      values (uid,t_id,s_id,oi_id,tn || ' (Demo)',st, now() + ((r.days_left - 30) || ' days')::interval, now() + (r.days_left || ' days')::interval);
  end loop;
end $$;
