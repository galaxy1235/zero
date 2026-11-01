// ข้อมูล Demo เท่านั้น — Phase 2 ย้ายไป website_templates / website_categories
import type { PlanId } from "@/lib/config/plans";
export const CATEGORIES = [
  { id: "shop", name: "ร้านค้าออนไลน์" }, { id: "service", name: "ธุรกิจบริการ" }, { id: "portfolio", name: "Portfolio" },
  { id: "food", name: "ร้านอาหาร" }, { id: "gaming", name: "Gaming" }, { id: "education", name: "Education" },
  { id: "agency", name: "Agency" }, { id: "landing", name: "Landing Page" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export interface Template {
  slug: string; name: string; tagline: string; category: CategoryId; businessType: string; tier: PlanId;
  accent: [string, string]; popularity: number; createdAt: string; features: string[];
}
export const TEMPLATES: Template[] = [
  { slug: "shoply", name: "Shoply", tagline: "ร้านแฟชั่นออนไลน์พร้อมขาย", category: "shop", businessType: "แฟชั่น", tier: "business", accent: ["#6C5CFF", "#38BDF8"], popularity: 98, createdAt: "2026-09-12", features: ["หน้าสินค้าและตะกร้า", "แบนเนอร์โปรโมชัน", "รองรับมือถือ"] },
  { slug: "clinica", name: "Clinica", tagline: "คลินิกและสปา จองคิวง่าย", category: "service", businessType: "ความงาม/สุขภาพ", tier: "business", accent: ["#14B8A6", "#6C5CFF"], popularity: 84, createdAt: "2026-08-20", features: ["แนะนำบริการ", "ฟอร์มนัดหมาย", "แผนที่และเวลาทำการ"] },
  { slug: "folio", name: "Folio", tagline: "แสดงผลงานสำหรับฟรีแลนซ์", category: "portfolio", businessType: "ฟรีแลนซ์", tier: "starter", accent: ["#F97316", "#EC4899"], popularity: 76, createdAt: "2026-07-05", features: ["แกลเลอรีผลงาน", "หน้าเกี่ยวกับฉัน", "ฟอร์มติดต่อ"] },
  { slug: "tasty", name: "Tasty", tagline: "คาเฟ่และร้านอาหาร", category: "food", businessType: "คาเฟ่", tier: "starter", accent: ["#EF4444", "#F59E0B"], popularity: 90, createdAt: "2026-10-01", features: ["เมนูพร้อมราคา", "รีวิวลูกค้า", "ช่องทางสั่งอาหาร"] },
  { slug: "arena", name: "Arena", tagline: "ทีมอีสปอร์ตและคอมมูนิตี้", category: "gaming", businessType: "อีสปอร์ต", tier: "business", accent: ["#8B5CF6", "#0EA5E9"], popularity: 71, createdAt: "2026-06-18", features: ["ตารางแข่ง", "โปรไฟล์ทีม", "ลิงก์ Discord"] },
  { slug: "learnly", name: "Learnly", tagline: "ขายคอร์สออนไลน์", category: "education", businessType: "คอร์สออนไลน์", tier: "premium", accent: ["#2563EB", "#22C55E"], popularity: 88, createdAt: "2026-09-28", features: ["รายการคอร์ส", "โปรไฟล์ผู้สอน", "ราคาและโปรโมชัน"] },
  { slug: "pixelworks", name: "Pixelworks", tagline: "เอเจนซี่ดิจิทัล", category: "agency", businessType: "การตลาด/ครีเอทีฟ", tier: "premium", accent: ["#0F172A", "#6C5CFF"], popularity: 80, createdAt: "2026-05-30", features: ["เคสผลงาน", "ทีมงาน", "ขอใบเสนอราคา"] },
  { slug: "launchpad", name: "Launchpad", tagline: "Landing Page เปิดตัวสินค้า", category: "landing", businessType: "สตาร์ทอัพ", tier: "starter", accent: ["#6C5CFF", "#EC4899"], popularity: 93, createdAt: "2026-10-15", features: ["Hero + CTA", "เปรียบเทียบฟีเจอร์", "ฟอร์มลงทะเบียน"] },
];
export const getTemplate = (slug: string) => TEMPLATES.find((t) => t.slug === slug);
export const categoryName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.name;
