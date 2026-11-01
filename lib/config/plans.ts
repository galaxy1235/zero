// ชนิดข้อมูลและตัวช่วยแสดงผลเท่านั้น — ราคาจริงอยู่ในตาราง pricing_plans (แหล่งเดียว)
export type PlanId = string;
export interface Plan { id: PlanId; name: string; monthly: number; yearly: number; sites: number; storageGb: number; customDomain: boolean; support: string }
export const formatTHB = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);
