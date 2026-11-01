import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-x flex flex-col justify-between gap-6 py-10 text-sm text-muted sm:flex-row">
        <div><p className="font-semibold text-fg">WebRent</p><p className="mt-1">บริการเช่าเว็บไซต์สำเร็จรูปสำหรับผู้ประกอบการ</p><p className="mt-1">ติดต่อ: hello@example.com (ตัวอย่าง)</p></div>
        <div className="flex gap-6"><Link href="/websites">เว็บไซต์</Link><Link href="/pricing">แพ็กเกจ</Link><span>นโยบายความเป็นส่วนตัว (เร็ว ๆ นี้)</span></div>
      </div>
    </footer>
  );
}
