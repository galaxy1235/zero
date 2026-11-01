import "server-only";
import { createClient } from "@supabase/supabase-js";
// Service role: ใช้ฝั่ง Server เท่านั้น (Webhook, สร้างออเดอร์) — ห้าม import จาก Client Component
export const createAdminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
