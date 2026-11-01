// เขียนมือชั่วคราว — แนะนำ `supabase gen types typescript` เมื่อเชื่อมโปรเจกต์จริง
export interface RentedWebsite { id: string; site_name: string; status: "provisioning" | "active" | "suspended" | "expired"; started_at: string | null; expires_at: string | null }
export interface Order { id: string; order_no: string; status: string; total_thb: number; created_at: string; order_items: { template_name_snapshot: string; plan_name_snapshot: string }[] }
export interface Subscription { id: string; plan_id: string; status: string; billing_cycle: string; current_period_end: string; cancel_at_period_end: boolean }
export interface Payment { id: string; provider: string; status: string; amount_thb: number; created_at: string; orders: { order_no: string } | null }
