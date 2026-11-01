export default function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="container-x py-24 text-center">
      <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">Coming Soon · {phase}</span>
      <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">ฟังก์ชันนี้ยังไม่เปิดใช้งาน และจะพัฒนาใน {phase} ตามแผนงาน</p>
    </div>
  );
}
