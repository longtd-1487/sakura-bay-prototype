import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
// Ban quản lý chợ: đình chỉ / khôi phục, sửa cấp quyền & hạn mức
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(["admin"]); if ("error" in auth) return auth.error;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.tier != null) patch.tier = Number(body.tier);
  if (body.credit_limit != null) patch.credit_limit = Number(body.credit_limit);
  const { data, error } = await supabaseAdmin().from("participants").update(patch).eq("id", params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}
