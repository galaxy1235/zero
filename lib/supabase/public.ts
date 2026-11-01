import { createClient } from "@supabase/supabase-js";
// อ่านข้อมูล Catalog สาธารณะ (RLS อนุญาตเฉพาะ is_active) ไม่ใช้ cookie และไม่ให้ Next แคชผลเก่า
export const createPublicClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    global: { fetch: (u, i) => fetch(u, { ...i, cache: "no-store" }) },
  });
