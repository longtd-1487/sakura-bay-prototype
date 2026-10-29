import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getRules } from "@/lib/rules";
// Tính 完納奨励金 cho một kỳ (US-14): bên mua thanh toán ĐỦ và TRƯỚC HẠN mọi hóa đơn của kỳ → thưởng = tỷ lệ × tổng tiền hàng.
export async function POST(req: Request) {
  const auth = await requireRole(["admin", "wholesaler"]); if ("error" in auth) return auth.error;
  const { period_start, period_end, action, id } = await req.json();
  const sb = supabaseAdmin();
  if (action === "approve") { // Ban quản lý duyệt – con người quyết định, máy chỉ đề xuất
    if (auth.profile.participant?.role !== "admin") return Response.json({ error: "Chỉ Ban quản lý chợ được duyệt" }, { status: 403 });
    const { error } = await sb.from("incentives").update({ status: "approved", approved_by: auth.profile.id }).eq("id", id).eq("status", "calculated");
    return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json({ ok: true });
  }
  const rules = await getRules(sb);
  const { data: invs } = await sb.from("invoices").select("*").eq("period_start", period_start).eq("period_end", period_end);
  const byBuyer = new Map<string, any[]>();
  for (const i of invs ?? []) byBuyer.set(i.buyer_id, [...(byBuyer.get(i.buyer_id) ?? []), i]);
  let created = 0;
  for (const [buyer_id, list] of byBuyer) {
    const fullOnTime = list.every((i) => i.status === "paid" && i.paid_at && new Date(i.paid_at) <= new Date(i.due_date + "T23:59:59"));
    if (!fullOnTime) continue;
    const base = list.reduce((s, i) => s + Number(i.subtotal), 0);
    const { error } = await sb.from("incentives").upsert({ buyer_id, period_start, period_end, base_amount: base, rate: rules.incentiveRate, amount: Math.round(base * rules.incentiveRate), status: "calculated" }, { onConflict: "buyer_id,period_start", ignoreDuplicates: true });
    if (!error) created += 1;
  }
  return Response.json({ created, evaluated: byBuyer.size });
}
