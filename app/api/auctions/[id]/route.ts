import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkBuyerEligibility } from "@/lib/rules";
// Ghi kết quả trúng giá (落札入力) cho 1 lot của phiên せり – US-08. Đấu giá vẫn diễn ra bằng tay; hệ thống chỉ ghi kết quả.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["wholesaler"]); if ("error" in auth) return auth.error;
  const b = await req.json();
  const sb = supabaseAdmin();
  const { data: lot } = await sb.from("lots").select("*").eq("id", b.lot_id).single();
  if (!lot || lot.status !== "available") return Response.json({ error: "Lot không còn để bán" }, { status: 400 });
  if (b.unsold) { // không ai mua → chuyển sang thỏa thuận (せり残)
    await sb.from("lots").update({ channel: "negotiation" }).eq("id", lot.id);
    return Response.json({ ok: true, unsold: true });
  }
  const { data: buyer } = await sb.from("participants").select("*").eq("id", b.buyer_id).single();
  if (!buyer) return Response.json({ error: "Không tìm thấy bên mua" }, { status: 400 });
  const price = Number(b.unit_price); if (!(price > 0)) return Response.json({ error: "Giá không hợp lệ" }, { status: 400 });
  const check = await checkBuyerEligibility(sb, buyer, Math.round(price * Number(lot.quantity)));
  if (!check.ok) return Response.json({ error: "Bên mua không đủ điều kiện", reasons: check.reasons }, { status: 422 });
  const { error } = await sb.from("transactions").insert({ trade_type: "auction", lot_id: lot.id, seller_id: auth.profile.participant_id, buyer_id: buyer.id, session_id: params.id, unit_price: price, quantity: lot.quantity, status: "confirmed", confirm_method: "verbal", confirmed_by_name: "せり人", confirmed_at: new Date().toISOString(), created_by: auth.profile.id });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await sb.from("lots").update({ status: "sold" }).eq("id", lot.id);
  return Response.json({ ok: true });
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["wholesaler", "admin"]); if ("error" in auth) return auth.error;
  const { status } = await req.json();
  const { error } = await supabaseAdmin().from("auction_sessions").update({ status }).eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
