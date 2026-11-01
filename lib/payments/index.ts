import { mockProvider } from "./mock";
import type { PaymentProvider } from "./types";
export function enabledProviders(): PaymentProvider[] {
  const list: PaymentProvider[] = [];
  if (process.env.NODE_ENV !== "production" && process.env.MOCK_WEBHOOK_SECRET) list.push(mockProvider);  // Mock ปิดเสมอบน Production
  return list;  // ผู้ให้บริการจริงเพิ่มที่นี่
}
export const getProvider = (id: string) => enabledProviders().find((p) => p.id === id) ?? null;
