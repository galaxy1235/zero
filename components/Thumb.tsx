import type { Template } from "@/lib/data/templates";
// ภาพตัวอย่างแบบ CSS (ไม่ใช้รูปภาพจริงใน Phase 1)
export default function Thumb({ t }: { t: Template }) {
  return (
    <div className="aspect-[16/10] overflow-hidden rounded-xl border border-line bg-white p-3" aria-hidden>
      <div className="h-2 w-16 rounded bg-slate-200" />
      <div className="mt-3 rounded-lg p-3" style={{ background: `linear-gradient(135deg, ${t.accent[0]}, ${t.accent[1]})` }}>
        <div className="h-2.5 w-2/3 rounded bg-white/90" /><div className="mt-2 h-2 w-1/2 rounded bg-white/60" /><div className="mt-3 h-5 w-14 rounded bg-white" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-8 rounded bg-slate-100" />)}</div>
    </div>
  );
}
