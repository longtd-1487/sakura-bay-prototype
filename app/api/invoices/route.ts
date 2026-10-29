import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getRules } from "@/lib/rules";
// Chốt kỳ (締め) → gộp giao dịch đã xác nhận trong kỳ thành hóa đơn theo từng bên mua – US-10
export async function POST(req: Request) {
  const auth = await requireRole(["wholesaler", "admin"]); if ("error" in auth) return auth.error;
  const { period_start, period_end } = await req.json();
  const sb = supabaseAdmin(); const rules = await getRules(sb);
  const { data: txs } = await sb.from("transactions").select("id,buyer_id,amount").eq("status", "confirmed").is("invoice_id", null).gte("trade_date", period_start).lte("trade_date", period_end);
  if (!txs?.length) return Response.json({ created: 0, message: "Không có giao dịch chưa lên hóa đơn trong kỳ" });
  const byBuyer = new Map<string, { ids: string[]; subtotal: number }>();
  for (const t of txs) { const g = byBuyer.get(t.buyer_id) ?? { ids: [], subtotal: 0 }; g.ids.push(t.id); g.subtotal += Number(t.amount); byBuyer.set(t.buyer_id, g); }
  const { count } = await sb.from("invoices").select("id", { count: "exact", head: true });
  let n = count ?? 0; const due = new Date(period_end); due.setDate(due.getDate() + rules.dueDays);
  for (const [buyer_id, g] of byBuyer) {
    // 奨励金 đã duyệt của kỳ trước → trừ vào hóa đơn này (US-14/15)
    const { data: inc } = await sb.from("incentives").select("id,amount").eq("buyer_id", buyer_id).eq("status", "approved");
    const deduction = (inc ?? []).reduce((s, i) => s + Number(i.amount), 0);
    const fee = Math.round(g.subtotal * rules.feeRate);
    const total = g.subtotal + fee - deduction; n += 1;
    const { data: inv, error } = await sb.from("invoices").insert({ invoice_no: `INV-${period_end.slice(0, 7).replace("-", "")}-${String(n).padStart(3, "0")}`, buyer_id, period_start, period_end, subtotal: g.subtotal, fee, incentive_deduction: deduction, total, due_date: due.toISOString().slice(0, 10) }).select().single();
    if (error) return Response.json({ error: error.message }, { status: 400 });
    await sb.from("transactions").update({ invoice_id: inv.id }).in("id", g.ids);
    if (inc?.length) await sb.from("incentives").update({ status: "applied" }).in("id", inc.map((i) => i.id));
  }
  return Response.json({ created: byBuyer.size });
}
