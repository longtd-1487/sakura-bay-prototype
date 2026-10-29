import type { SupabaseClient } from "@supabase/supabase-js";
import type { Participant } from "@/lib/types";

export async function getRules(sb: SupabaseClient) {
  const { data } = await sb.from("market_rules").select("key,value");
  const r = Object.fromEntries((data ?? []).map((x) => [x.key, Number(x.value)]));
  return { feeRate: r.fee_rate ?? 0.055, incentiveRate: r.incentive_rate ?? 0.01, dueDays: r.due_days ?? 15 };
}

/**
 * Kiểm tra quyền mua theo 業務規程 trước khi chốt giao dịch (US-01, US-11):
 *  1. Bên mua phải là cấp 1 (仲卸 / 売買参加者) – 買出人 KHÔNG được mua trực tiếp.
 *  2. Không bị đình chỉ (取引停止).
 *  3. Giá trị giao dịch + công nợ chưa thanh toán ≤ hạn mức.
 * Trả về danh sách lý do chặn (rỗng = được phép).
 */
export async function checkBuyerEligibility(sb: SupabaseClient, buyer: Participant, amount: number) {
  const reasons: string[] = [];
  if (buyer.tier !== 1) reasons.push(buyer.role === "retail"
    ? "Người mua lẻ (買出人) là cấp 2 – chỉ được mua lại từ công ty trung gian, không mua trực tiếp từ công ty bán buôn."
    : "Vai trò này không có quyền mua.");
  if (buyer.status === "suspended") reasons.push("Bên mua đang bị đình chỉ giao dịch (取引停止).");
  const { data: inv } = await sb.from("invoices").select("total,paid_amount").eq("buyer_id", buyer.id).neq("status", "paid");
  const { data: pend } = await sb.from("transactions").select("amount").eq("buyer_id", buyer.id).eq("status", "confirmed").is("invoice_id", null);
  const outstanding = (inv ?? []).reduce((s, i) => s + Number(i.total) - Number(i.paid_amount), 0) + (pend ?? []).reduce((s, t) => s + Number(t.amount), 0);
  if (buyer.credit_limit > 0 && outstanding + amount > Number(buyer.credit_limit))
    reasons.push(`Vượt hạn mức: công nợ ${outstanding.toLocaleString("ja-JP")} + giao dịch ${amount.toLocaleString("ja-JP")} > hạn mức ${Number(buyer.credit_limit).toLocaleString("ja-JP")} JPY.`);
  return { ok: reasons.length === 0, reasons, outstanding };
}
