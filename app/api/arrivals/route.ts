import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
// Đăng ký lô nhập (入荷登録) kèm các lot – US-02
export async function POST(req: Request) {
  const auth = await requireRole(["wholesaler", "admin"]); if ("error" in auth) return auth.error;
  const b = await req.json();
  if (!b.vessel_id || !b.arrival_date || !Array.isArray(b.lots) || b.lots.length === 0) return Response.json({ error: "Thiếu tàu, ngày hoặc danh sách lot" }, { status: 400 });
  const sb = supabaseAdmin();
  const { data: arr, error } = await sb.from("arrivals").insert({ vessel_id: b.vessel_id, arrival_date: b.arrival_date, trade_form: b.trade_form ?? "consignment", note: b.note ?? null, created_by: auth.profile.id }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { count } = await sb.from("lots").select("id", { count: "exact", head: true });
  const rows = b.lots.map((l: any, i: number) => ({ lot_no: `L-${String((count ?? 0) + i + 1).padStart(4, "0")}`, arrival_id: arr.id, species_id: l.species_id, quantity: Number(l.quantity), size_grade: l.size_grade ?? null }));
  const { error: e2 } = await sb.from("lots").insert(rows);
  if (e2) return Response.json({ error: e2.message }, { status: 400 });
  return Response.json({ id: arr.id, lots: rows.length });
}
