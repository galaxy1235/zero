import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, formatTHB } from "@/lib/config/plans";
export default function PricingCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLANS.map((p) => (
        <div key={p.id} className={`card p-6 ${p.popular ? "ring-2 ring-primary" : ""}`}>
          <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{p.name}</h3>{p.popular && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">แนะนำ</span>}</div>
          <p className="mt-3 text-3xl font-semibold">{formatTHB(p.monthly)}<span className="text-sm font-normal text-muted">/เดือน</span></p>
          <p className="text-sm text-muted">หรือ {formatTHB(p.yearly)}/ปี</p>
          <ul className="mt-5 space-y-2 text-sm">
            {[...p.features, `พื้นที่จัดเก็บ ${p.storageGb} GB`, p.customDomain ? "รองรับโดเมนส่วนตัว" : "ยังไม่รองรับโดเมนส่วนตัว", `ซัพพอร์ต: ${p.support}`].map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-primary" />{f}</li>)}
          </ul>
          <Link href={`/checkout?plan=${p.id}`} className={`${p.popular ? "btn-primary" : "btn-ghost"} mt-6 w-full`}>เลือกแพ็กเกจ</Link>
        </div>
      ))}
    </div>
  );
}
