import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, StatusPill, Notice } from "@/components/ui";
import { ApiButton } from "@/components/actions";
import { yen, dateJP, periodOf } from "@/lib/format";
export default async function Invoices() {
  const me = await getCurrentProfile(); const role = me?.participant?.role; const sb = supabaseServer();
  let q = sb.from("invoices").select("*,buyer:participants(name)").order("period_end", { ascending: false }).order("invoice_no");
  if (me?.participant && me.participant.tier > 0) q = q.eq("buyer_id", me.participant.id);
  const { data } = await q;
  const { count: open } = await sb.from("transactions").select("id", { count: "exact", head: true }).eq("status", "confirmed").is("invoice_id", null);
  const p = periodOf(); const prev = periodOf(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  const canClose = role === "wholesaler" || role === "admin";
  return (<>
    <PageHeader title="Hóa đơn & tiền về" jp="請求書・入金消込">
      {canClose && <ApiButton url="/api/invoices" body={{ period_start: prev.start, period_end: prev.end }} className="btn-ghost">Chốt kỳ {prev.label}</ApiButton>}
      {canClose && <ApiButton url="/api/invoices" body={{ period_start: p.start, period_end: p.end }} className="btn-dark" confirm={`Chốt kỳ ${p.label} ngay bây giờ? (bình thường chạy cuối tháng)`}>Chốt kỳ {p.label} (tạm)</ApiButton>}
    </PageHeader>
    {canClose && <Notice>Có <b>{open ?? 0}</b> giao dịch đã chốt chưa lên hóa đơn. "Chốt kỳ" gộp theo từng bên mua, cộng phí hoa hồng theo quy tắc và trừ tiền thưởng kỳ trước đã duyệt.</Notice>}
    <div className="card mt-4 overflow-x-auto"><table className="tbl">
      <thead><tr><th>Số hóa đơn</th><th>Bên mua</th><th>Kỳ</th><th>Tiền hàng</th><th>Phí</th><th>Trừ thưởng</th><th>Tổng</th><th>Đã trả</th><th>Hạn</th><th>Trạng thái</th></tr></thead>
      <tbody>{(data ?? []).map((i: any) => <tr key={i.id}><td><Link className="font-medium text-buoy-600 hover:underline" href={`/invoices/${i.id}`}>{i.invoice_no}</Link></td><td>{i.buyer?.name}</td><td>{dateJP(i.period_start)}–{dateJP(i.period_end)}</td><td>{yen(i.subtotal)}</td><td>{yen(i.fee)}</td><td>{i.incentive_deduction > 0 ? "−" + yen(i.incentive_deduction) : "–"}</td><td className="font-medium">{yen(i.total)}</td><td>{yen(i.paid_amount)}</td><td className={new Date(i.due_date) < new Date() && i.status !== "paid" ? "text-coral-600 font-medium" : ""}>{dateJP(i.due_date)}</td><td><StatusPill value={i.status} /></td></tr>)}</tbody>
    </table></div>
  </>);
}
