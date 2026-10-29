import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
// Thẩm định độ tươi + ký hiệu riêng (US-03) và chia kênh bán (US-04). Hệ thống chỉ LƯU quyết định của người.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["wholesaler", "admin"]); if ("error" in auth) return auth.error;
  const b = await req.json();
  const patch: Record<string, unknown> = {};
  if (b.freshness_rank !== undefined) { patch.freshness_rank = b.freshness_rank || null; patch.freshness_note = b.freshness_note ?? null; patch.market_mark = b.market_mark ?? null; patch.assessed_by = auth.profile.id; patch.assessed_at = new Date().toISOString(); }
  if (b.channel) patch.channel = b.channel;
  const { data, error } = await supabaseAdmin().from("lots").update(patch).eq("id", params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}
