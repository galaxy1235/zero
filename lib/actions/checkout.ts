"use server";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/payments";
import { signMock } from "@/lib/payments/mock";
const uuid = z.string().uuid();
async function goPay(orderId: string, providerId: string): Promise<never> {
  const sb = createClient();
  const { data: o } = await sb.from("orders").select("id,order_no,total_thb,status").eq("id", orderId).maybeSingle();  // RLS: เห็นเฉพาะออเดอร์ตัวเอง
  const provider = getProvider(providerId);
  if (!o || !provider || !["pending", "failed"].includes(o.status)) redirect(`/checkout/status?order=${orderId}`);
  const { redirectUrl } = await provider.createCheckout({ id: o.id, orderNo: o.order_no, totalThb: o.total_thb });
  redirect(redirectUrl);
}
export async function placeOrder(_: FormState, fd: FormData): Promise<FormState> {
  const p = z.object({
    slug: z.string().regex(/^[a-z0-9-]{1,100}$/), cycle: z.enum(["monthly", "yearly"]), idem: uuid, provider: z.string().min(1).max(30),
    full_name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(100), phone: z.string().trim().regex(/^[0-9+\-\s]{6,20}$/, "เบอร์โทรไม่ถูกต้อง"), business_name: z.string().trim().max(150),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message };
  if (!getProvider(p.data.provider)) return { error: "ช่องทางชำระเงินนี้ไม่เปิดใช้งาน" };
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  // ราคา/ยอดรวมคำนวณใน DB จาก slug+cycle เท่านั้น — ไม่รับยอดเงินจาก Client
  const { data: orderId, error } = await createAdminClient().rpc("create_order", { p_user: user.id, p_slug: p.data.slug, p_cycle: p.data.cycle, p_idem: p.data.idem });
  if (error || !orderId) return { error: "ไม่สามารถสร้างคำสั่งซื้อได้ (เว็บไซต์อาจไม่พร้อมให้เช่า) กรุณาลองใหม่" };
  await sb.from("profiles").update({ full_name: p.data.full_name, phone: p.data.phone, business_name: p.data.business_name || null }).eq("id", user.id);
  return goPay(orderId as string, p.data.provider);
}
export async function payNow(fd: FormData) {
  const id = uuid.safeParse(fd.get("order"));
  if (!id.success) redirect("/dashboard/orders");
  await goPay(id.data, String(fd.get("provider") ?? ""));
}
export async function cancelOrder(fd: FormData) {
  const id = uuid.safeParse(fd.get("order"));
  if (!id.success) redirect("/dashboard/orders");
  await createClient().rpc("cancel_pending_order", { p_order: id.data });
  redirect(`/checkout/status?order=${id.data}`);
}
export async function renewSite(fd: FormData) {
  const p = z.object({ site: uuid, idem: uuid }).safeParse(Object.fromEntries(fd));
  if (!p.success) redirect("/dashboard/websites");
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await createAdminClient().rpc("create_renewal_order", { p_user: user.id, p_site: p.data.site, p_idem: p.data.idem });
  if (error || !data) redirect("/dashboard/websites");
  redirect(`/checkout/status?order=${data}`);
}
export async function toggleCancel(fd: FormData) {
  const p = z.object({ sub: uuid, cancel: z.enum(["0", "1"]) }).safeParse(Object.fromEntries(fd));
  if (p.success) await createClient().rpc("set_cancel_at_period_end", { p_sub: p.data.sub, p_cancel: p.data.cancel === "1" });
  revalidatePath("/dashboard/billing");
}
// Dev เท่านั้น: จำลองผู้ให้บริการส่ง Webhook (ลงลายเซ็น) กลับมาที่ endpoint จริง — หน้า Success ไม่ได้เปลี่ยนสถานะเอง
export async function mockPay(fd: FormData) {
  const id = uuid.safeParse(fd.get("order"));
  const ok = fd.get("outcome") === "success";
  if (!id.success || !getProvider("mock")) redirect("/dashboard/orders");
  const { data: o } = await createClient().from("orders").select("id,total_thb,status").eq("id", id.data).maybeSingle();
  if (o && ["pending", "failed"].includes(o.status)) {
    const raw = JSON.stringify({ type: ok ? "payment.succeeded" : "payment.failed", orderId: o.id, providerRef: `mock_${randomUUID()}`, amountThb: o.total_thb });
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    await fetch(`${base}/api/webhooks/mock`, { method: "POST", headers: { "content-type": "application/json", "x-mock-signature": signMock(raw) }, body: raw, cache: "no-store" });
  }
  redirect(`/checkout/status?order=${id.data}`);
}
