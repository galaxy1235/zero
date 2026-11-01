const MAP: Record<string, [string, string]> = {
  pending: ["รอดำเนินการ", "bg-amber-500/10 text-amber-700 dark:text-amber-400"], paid: ["ชำระแล้ว", "bg-green-500/10 text-green-700 dark:text-green-400"],
  succeeded: ["สำเร็จ", "bg-green-500/10 text-green-700 dark:text-green-400"], failed: ["ไม่สำเร็จ", "bg-red-500/10 text-red-600 dark:text-red-400"],
  cancelled: ["ยกเลิก", "bg-slate-500/10 text-muted"], refunded: ["คืนเงินแล้ว", "bg-sky-500/10 text-sky-700 dark:text-sky-400"],
  active: ["ใช้งานอยู่", "bg-green-500/10 text-green-700 dark:text-green-400"], provisioning: ["กำลังเตรียมเว็บไซต์", "bg-amber-500/10 text-amber-700 dark:text-amber-400"],
  suspended: ["ถูกระงับ", "bg-red-500/10 text-red-600 dark:text-red-400"], expired: ["หมดอายุ", "bg-slate-500/10 text-muted"], past_due: ["ค้างชำระ", "bg-red-500/10 text-red-600 dark:text-red-400"],
};
export default function StatusBadge({ status }: { status: string }) {
  const [label, cls] = MAP[status] ?? [status, "bg-slate-500/10 text-muted"];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}
