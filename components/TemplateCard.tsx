import Link from "next/link";
import { categoryName, type Template } from "@/lib/data/templates";
import { formatTHB } from "@/lib/config/plans";
import Thumb from "./Thumb";
export default function TemplateCard({ t }: { t: Template }) {
  return (
    <article className="card group p-3 transition hover:-translate-y-0.5">
      <Link href={`/websites/${t.slug}`} aria-label={t.name}><Thumb t={t} /></Link>
      <div className="px-1 pb-1 pt-3">
        <p className="text-xs text-muted">{categoryName(t.category)}</p>
        <h3 className="font-semibold">{t.name}</h3>
        <p className="text-sm text-muted">เริ่มต้น {formatTHB(t.monthly)}/เดือน</p>
        <div className="mt-3 flex gap-2">
          <Link href={`/websites/${t.slug}`} className="btn-ghost flex-1 !py-2">รายละเอียด</Link>
          <Link href={`/preview/${t.slug}`} className="btn-primary flex-1 !py-2">ทดลองใช้</Link>
        </div>
      </div>
    </article>
  );
}
