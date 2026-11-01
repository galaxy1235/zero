import { createPublicClient } from "@/lib/supabase/public";
import { VISUALS, type CategoryId, type Template } from "@/lib/data/templates";
import type { Plan } from "@/lib/config/plans";
type PlanRow = { name: string; monthly_price_thb: number; yearly_price_thb: number };
type Row = { slug: string; name: string; tagline: string; category_id: string; business_type: string; popularity: number; created_at: string; plan_id: string; pricing_plans: PlanRow | PlanRow[] | null };
const COLS = "slug,name,tagline,category_id,business_type,popularity,created_at,plan_id,pricing_plans(name,monthly_price_thb,yearly_price_thb)";
const toTemplate = (r: Row): Template => {
  const p = Array.isArray(r.pricing_plans) ? r.pricing_plans[0] : r.pricing_plans;
  const v = VISUALS[r.slug] ?? { accent: ["#6C5CFF", "#38BDF8"] as [string, string], features: [] };
  return { slug: r.slug, name: r.name, tagline: r.tagline, category: r.category_id as CategoryId, businessType: r.business_type, planId: r.plan_id, planName: p?.name ?? r.plan_id, monthly: p?.monthly_price_thb ?? 0, yearly: p?.yearly_price_thb ?? 0, accent: v.accent, popularity: r.popularity, createdAt: r.created_at, features: v.features };
};
export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await createPublicClient().from("website_templates").select(COLS).eq("is_active", true).is("deleted_at", null).order("popularity", { ascending: false });
  if (error) throw new Error("catalog_unavailable");
  return (data as unknown as Row[]).map(toTemplate);
}
export async function getTemplate(slug: string): Promise<Template | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  const { data, error } = await createPublicClient().from("website_templates").select(COLS).eq("slug", slug).eq("is_active", true).is("deleted_at", null).maybeSingle();
  if (error) throw new Error("catalog_unavailable");
  return data ? toTemplate(data as unknown as Row) : null;
}
export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await createPublicClient().from("pricing_plans").select("id,name,monthly_price_thb,yearly_price_thb,max_sites,storage_gb,custom_domain,support_level").eq("is_active", true).order("monthly_price_thb");
  if (error) throw new Error("catalog_unavailable");
  return (data ?? []).map((p) => ({ id: p.id, name: p.name, monthly: p.monthly_price_thb, yearly: p.yearly_price_thb, sites: p.max_sites, storageGb: p.storage_gb, customDomain: p.custom_domain, support: p.support_level }));
}
