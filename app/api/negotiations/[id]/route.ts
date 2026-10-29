import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
// Xác nhận giao dịch (US-06): bên mua bấm trên app, hoặc bán buôn ghi "xác nhận miệng" kèm tên.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["wholesaler", "intermediate", "participant"]); if ("error" in auth) return auth.error;
  const b = await req.json();
  const sb = supabaseAdmin();
  const { data: tx } = await sb.from("transactions").select("*").eq("id", params.id).single();
  if (!tx || tx.status !== "pending") return Response.json({ error: "Giao dịch không ở trạng thái chờ xác nhận" }, { status: 400 });
  const me = auth.profile.participant;
  let method: "app" | "verbal"; let name: string | null = null;
  if (me?.role === "wholesaler") { method = "verbal"; name = (b.confirmed_by_name ?? "").trim(); if (!name) return Response.json({ error: "Cần ghi tên người xác nhận miệng" }, { status: 400 }); }
  else { if (me?.id !== tx.buyer_id) return Response.json({ error: "Chỉ bên mua của giao dịch này mới xác nhận được" }, { status: 403 }); method = "app"; }
  const { error } = await sb.from("transactions").update({ status: "confirmed", confirm_method: method, confirmed_by_name: name, confirmed_at: new Date().toISOString() }).eq("id", tx.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await sb.from("lots").update({ status: "sold" }).eq("id", tx.lot_id);
  return Response.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["wholesaler", "admin"]); if ("error" in auth) return auth.error;
  const { error } = await supabaseAdmin().from("transactions").update({ status: "cancelled" }).eq("id", params.id).eq("status", "pending");
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
