import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkBuyerEligibility } from "@/lib/rules";
// Ghi nhận giao dịch thỏa thuận (相対取引) – US-05 + kiểm tra quyền US-01/US-11
export async function POST(req: Request) {
  const auth = await requireRole(["wholesaler"]); if ("error" in auth) return auth.error;
  const b = await req.json();
  const sb = supabaseAdmin();
  const { data: buyer } = await sb.from("participants").select("*").eq("id", b.buyer_id).single();
  const { data: lot } = await sb.from("lots").select("*").eq("id", b.lot_id).single();
  if (!buyer || !lot) return Response.json({ error: "Không tìm thấy lot hoặc bên mua" }, { status: 400 });
  if (lot.status !== "available") return Response.json({ error: "Lot này đã bán hoặc đã rút" }, { status: 400 });
  const qty = Number(b.quantity), price = Number(b.unit_price);
  if (!(qty > 0) || !(price > 0) || qty > Number(lot.quantity)) return Response.json({ error: "Số lượng/giá không hợp lệ" }, { status: 400 });
  const check = await checkBuyerEligibility(sb, buyer, Math.round(qty * price));
  if (b.dry_run) return Response.json(check);
  if (!check.ok) return Response.json({ error: "Không thể chốt giao dịch", reasons: check.reasons }, { status: 422 });
  const { data, error } = await sb.from("transactions").insert({ trade_type: "negotiation", lot_id: lot.id, seller_id: auth.profile.participant_id, buyer_id: buyer.id, unit_price: price, quantity: qty, status: "pending", created_by: auth.profile.id }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}
