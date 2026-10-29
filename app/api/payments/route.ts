import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
// Ghi nhận tiền về (入金) & khớp với hóa đơn (消込) – US-11. Nhập tay thay cho import sao kê (mock).
export async function POST(req: Request) {
  const auth = await requireRole(["wholesaler", "admin"]); if ("error" in auth) return auth.error;
  const { invoice_id, amount, paid_at } = await req.json();
  const sb = supabaseAdmin();
  const { data: inv } = await sb.from("invoices").select("*").eq("id", invoice_id).single();
  if (!inv) return Response.json({ error: "Không tìm thấy hóa đơn" }, { status: 404 });
  const amt = Number(amount); if (!(amt > 0)) return Response.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  await sb.from("payments").insert({ invoice_id, amount: amt, paid_at });
  const paid = Number(inv.paid_amount) + amt;
  const status = paid >= Number(inv.total) ? "paid" : "partial";
  await sb.from("invoices").update({ paid_amount: paid, status, paid_at: status === "paid" ? paid_at : null }).eq("id", invoice_id);
  return Response.json({ ok: true, status });
}
