// แหล่งความจริงเดียวของราคา (Demo) — Phase 2 ย้ายไปตาราง pricing_plans ใน DB
export type PlanId = "starter" | "business" | "premium";
export interface Plan {
  id: PlanId; name: string; monthly: number; yearly: number; sites: number; storageGb: number;
  customDomain: boolean; support: string; features: string[]; popular?: boolean;
}
export const PLANS: Plan[] = [
  { id: "starter", name: "Starter", monthly: 299, yearly: 2990, sites: 1, storageGb: 2, customDomain: false, support: "อีเมล", features: ["1 เว็บไซต์", "ซับโดเมนฟรี", "แก้ไขข้อความและรูปภาพ"] },
  { id: "business", name: "Business", monthly: 599, yearly: 5990, sites: 3, storageGb: 10, customDomain: true, support: "แชต (วันทำการ)", popular: true, features: ["สูงสุด 3 เว็บไซต์", "โดเมนส่วนตัว", "ปรับโลโก้และสีหลัก"] },
  { id: "premium", name: "Premium", monthly: 1199, yearly: 11990, sites: 10, storageGb: 50, customDomain: true, support: "แชตด่วน", features: ["สูงสุด 10 เว็บไซต์", "โดเมนส่วนตัวหลายโดเมน", "ซัพพอร์ตลำดับความสำคัญสูง"] },
];
export const getPlan = (id: PlanId) => PLANS.find((p) => p.id === id)!;
export const formatTHB = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);
