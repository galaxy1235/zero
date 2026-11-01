import type { PlanId } from "@/lib/config/plans";
// หมวดหมู่ (ชื่อแสดงผล) และข้อมูลภาพของ Template — ราคา/สถานะมาจาก DB ผ่าน lib/catalog.ts
export const CATEGORIES = [
  { id: "shop", name: "ร้านค้าออนไลน์" }, { id: "service", name: "ธุรกิจบริการ" }, { id: "portfolio", name: "Portfolio" },
  { id: "food", name: "ร้านอาหาร" }, { id: "gaming", name: "Gaming" }, { id: "education", name: "Education" },
  { id: "agency", name: "Agency" }, { id: "landing", name: "Landing Page" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export interface Template {
  slug: string; name: string; tagline: string; category: CategoryId; businessType: string;
  planId: PlanId; planName: string; monthly: number; yearly: number;
  accent: [string, string]; popularity: number; createdAt: string; features: string[];
}
export const VISUALS: Record<string, { accent: [string, string]; features: string[] }> = {
  shoply: { accent: ["#6C5CFF", "#38BDF8"], features: ["หน้าสินค้าและตะกร้า", "แบนเนอร์โปรโมชัน", "รองรับมือถือ"] },
  clinica: { accent: ["#14B8A6", "#6C5CFF"], features: ["แนะนำบริการ", "ฟอร์มนัดหมาย", "แผนที่และเวลาทำการ"] },
  folio: { accent: ["#F97316", "#EC4899"], features: ["แกลเลอรีผลงาน", "หน้าเกี่ยวกับฉัน", "ฟอร์มติดต่อ"] },
  tasty: { accent: ["#EF4444", "#F59E0B"], features: ["เมนูพร้อมราคา", "รีวิวลูกค้า", "ช่องทางสั่งอาหาร"] },
  arena: { accent: ["#8B5CF6", "#0EA5E9"], features: ["ตารางแข่ง", "โปรไฟล์ทีม", "ลิงก์ Discord"] },
  learnly: { accent: ["#2563EB", "#22C55E"], features: ["รายการคอร์ส", "โปรไฟล์ผู้สอน", "ราคาและโปรโมชัน"] },
  pixelworks: { accent: ["#0F172A", "#6C5CFF"], features: ["เคสผลงาน", "ทีมงาน", "ขอใบเสนอราคา"] },
  launchpad: { accent: ["#6C5CFF", "#EC4899"], features: ["Hero + CTA", "เปรียบเทียบฟีเจอร์", "ฟอร์มลงทะเบียน"] },
};
export const categoryName = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? id;
