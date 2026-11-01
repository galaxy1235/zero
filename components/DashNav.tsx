"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Globe, LayoutDashboard, Receipt, User } from "lucide-react";
const ITEMS = [
  { href: "/dashboard", label: "ภาพรวม", Icon: LayoutDashboard }, { href: "/dashboard/websites", label: "เว็บไซต์ของฉัน", Icon: Globe },
  { href: "/dashboard/orders", label: "คำสั่งซื้อ", Icon: Receipt }, { href: "/dashboard/billing", label: "การเรียกเก็บเงิน", Icon: CreditCard },
  { href: "/dashboard/profile", label: "โปรไฟล์", Icon: User },
];
export default function DashNav() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูแดชบอร์ด" className="flex gap-1 overflow-x-auto md:flex-col">
      {ITEMS.map(({ href, label, Icon }) => {
        const on = href === "/dashboard" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm ${on ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-surface"}`}><Icon size={16} />{label}</Link>;
      })}
    </nav>
  );
}
