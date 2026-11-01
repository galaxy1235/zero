"use client";
import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
const DEVICES = { desktop: { w: "100%", Icon: Monitor, label: "Desktop" }, tablet: { w: "768px", Icon: Tablet, label: "Tablet" }, mobile: { w: "390px", Icon: Smartphone, label: "Mobile" } } as const;
type D = keyof typeof DEVICES;
export default function PreviewFrame({ slug, heightClass = "h-[520px]" }: { slug: string; heightClass?: string }) {
  const [d, setD] = useState<D>("desktop");
  return (
    <div>
      <div className="flex gap-2" role="group" aria-label="ขนาดหน้าจอ">
        {(Object.keys(DEVICES) as D[]).map((k) => {
          const { Icon, label } = DEVICES[k];
          return <button key={k} onClick={() => setD(k)} aria-pressed={d === k} className={`btn !py-2 border ${d === k ? "border-primary bg-primary text-white" : "border-line bg-surface"}`}><Icon size={14} />{label}</button>;
        })}
      </div>
      <div className={`mt-3 overflow-auto rounded-xl2 border border-line bg-surface p-2 ${heightClass}`}>
        {/* sandbox="" = ไม่อนุญาตสคริปต์/ฟอร์ม; แสดงเฉพาะหน้า Demo ที่เราควบคุมเอง */}
        <iframe title={`ตัวอย่าง ${slug}`} src={`/demo/${slug}`} sandbox="" loading="lazy" style={{ width: DEVICES[d].w, maxWidth: "100%" }} className="mx-auto block h-full rounded-xl bg-white transition-all" />
      </div>
    </div>
  );
}
