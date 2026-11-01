import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function requireUser() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();  // getUser() ตรวจกับ Supabase จริง ไม่เชื่อ cookie อย่างเดียว
  if (!user) redirect("/login");
  return { sb, user };
}
