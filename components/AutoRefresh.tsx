"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function AutoRefresh({ ms = 3000 }: { ms?: number }) {
  const r = useRouter();
  useEffect(() => { const i = setInterval(() => r.refresh(), ms); return () => clearInterval(i); }, [r, ms]);
  return null;
}
