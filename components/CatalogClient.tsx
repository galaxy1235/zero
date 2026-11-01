"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, type Template } from "@/lib/data/templates";
import type { Plan } from "@/lib/config/plans";
import TemplateCard from "./TemplateCard";
const sel = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";
export default function CatalogClient({ templates, plans }: { templates: Template[]; plans: Plan[] }) {
  const [q, setQ] = useState(""); const [cat, setCat] = useState("all"); const [tier, setTier] = useState("all");
  const [biz, setBiz] = useState("all"); const [sort, setSort] = useState("popular");
  const bizTypes = useMemo(() => Array.from(new Set(templates.map((t) => t.businessType))), [templates]);
  const list = useMemo(() => {
    const r = templates.filter((t) => (!q || t.name.toLowerCase().includes(q.toLowerCase())) && (cat === "all" || t.category === cat) && (tier === "all" || t.planId === tier) && (biz === "all" || t.businessType === biz));
    const by = { popular: (a: Template, b: Template) => b.popularity - a.popularity, price: (a: Template, b: Template) => a.monthly - b.monthly, new: (a: Template, b: Template) => b.createdAt.localeCompare(a.createdAt) }[sort]!;
    return [...r].sort(by);
  }, [templates, q, cat, tier, biz, sort]);
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <label className="relative min-w-[200px] flex-1"><span className="sr-only">ค้นหา</span><Search size={16} className="absolute left-3 top-2.5 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อเว็บไซต์" className={`${sel} w-full pl-9`} /></label>
        <select aria-label="หมวดหมู่" className={sel} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">ทุกหมวดหมู่</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select aria-label="ราคา" className={sel} value={tier} onChange={(e) => setTier(e.target.value)}><option value="all">ทุกระดับราคา</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select aria-label="ประเภทธุรกิจ" className={sel} value={biz} onChange={(e) => setBiz(e.target.value)}><option value="all">ทุกประเภทธุรกิจ</option>{bizTypes.map((b) => <option key={b}>{b}</option>)}</select>
        <select aria-label="เรียงตาม" className={sel} value={sort} onChange={(e) => setSort(e.target.value)}><option value="popular">ยอดนิยม</option><option value="price">ราคาต่ำสุด</option><option value="new">มาใหม่</option></select>
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">พบ {list.length} รายการ</p>
      {list.length ? <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((t) => <TemplateCard key={t.slug} t={t} />)}</div>
        : <div className="card mt-6 p-10 text-center text-muted">ไม่พบเว็บไซต์ที่ตรงกับเงื่อนไข ลองปรับตัวกรองดู</div>}
    </div>
  );
}
