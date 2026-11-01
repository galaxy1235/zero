export interface PaymentOrder { id: string; orderNo: string; totalThb: number }
export interface WebhookEvent { type: "payment.succeeded" | "payment.failed"; orderId: string; providerRef: string; amountThb: number }
// เพิ่มผู้ให้บริการจริงโดย implement interface นี้แล้วลงทะเบียนใน lib/payments/index.ts
export interface PaymentProvider {
  id: string; label: string; isTest: boolean;
  createCheckout(o: PaymentOrder): Promise<{ redirectUrl: string }>;
  verifyWebhook(rawBody: string, headers: Headers): WebhookEvent | null;  // คืน null ถ้า Signature/รูปแบบไม่ถูกต้อง
}
