import Link from "next/link";
import { Check } from "lucide-react";
import { formatTHB, type Plan } from "@/lib/config/plans";
export default function PricingCards({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {plans.map((p) => (
        <div key={p.id} className="card p-6">
          <h3 className="text-lg font-semibold">{p.name}</h3>
          <p className="mt-3 text-3xl font-semibold">{formatTHB(p.monthly)}<span className="text-sm font-normal text-muted">/เดือน</span></p>
          <p className="text-sm text-muted">หรือ {formatTHB(p.yearly)}/ปี</p>
          <ul className="mt-5 space-y-2 text-sm">
            {[`เช่าได้สูงสุด ${p.sites} เว็บไซต์`, `พื้นที่จัดเก็บ ${p.storageGb} GB`, p.customDomain ? "รองรับโดเมนส่วนตัว" : "ยังไม่รองรับโดเมนส่วนตัว", `ซัพพอร์ต: ${p.support}`].map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-primary" />{f}</li>)}
          </ul>
          <Link href="/websites" className="btn-ghost mt-6 w-full">เลือกเว็บไซต์ในแพ็กเกจนี้</Link>
        </div>
      ))}
    </div>
  );
}
