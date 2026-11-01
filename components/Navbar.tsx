"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
const LINKS = [{ href: "/websites", label: "เว็บไซต์" }, { href: "/pricing", label: "แพ็กเกจราคา" }, { href: "/#faq", label: "คำถามที่พบบ่อย" }];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Globe size={16} /></span>WebRent</Link>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">{LINKS.map((l) => <Link key={l.href} href={l.href} className="hover:text-fg">{l.label}</Link>)}</nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-primary hidden sm:inline-flex">เข้าสู่ระบบ</Link>
          <button className="btn-ghost !px-3 md:hidden" aria-label="เมนู" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={16} /> : <Menu size={16} />}</button>
        </div>
      </div>
      {open && (
        <nav className="container-x flex flex-col gap-1 pb-4 md:hidden">
          {[...LINKS, { href: "/login", label: "เข้าสู่ระบบ" }].map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-surface">{l.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
