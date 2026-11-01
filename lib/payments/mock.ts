import crypto from "crypto";
import { z } from "zod";
import type { PaymentProvider } from "./types";
const secret = () => process.env.MOCK_WEBHOOK_SECRET ?? "";
export const signMock = (raw: string) => crypto.createHmac("sha256", secret()).update(raw).digest("hex");
const schema = z.object({ type: z.enum(["payment.succeeded", "payment.failed"]), orderId: z.string().uuid(), providerRef: z.string().min(1).max(100), amountThb: z.number().int().nonnegative() });
export const mockProvider: PaymentProvider = {
  id: "mock", label: "ชำระเงินทดสอบ (Mock — เฉพาะ Development)", isTest: true,
  async createCheckout(o) { return { redirectUrl: `/checkout/mock?order=${o.id}` }; },
  verifyWebhook(raw, headers) {
    if (!secret()) return null;
    const sig = headers.get("x-mock-signature") ?? "", exp = signMock(raw);
    if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
    try { const r = schema.safeParse(JSON.parse(raw)); return r.success ? r.data : null; } catch { return null; }
  },
};
