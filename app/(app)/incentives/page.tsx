import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, StatusPill, Notice } from "@/components/ui";
import { ApiButton } from "@/components/actions";
import { yen, dateJP, periodOf } from "@/lib/format";
import { getRules } from "@/lib/rules";
export default async function Incentives() {
  const me = await getCurrentProfile(); const role = me?.participant?.role; const sb = supabaseServer();
  let q = sb.from("incentives").select("*,buyer:participants(name)").order("period_start", { ascending: false });
  if (me?.participant && me.participant.tier > 0) q = q.eq("buyer_id", me.participant.id);
  const [{ data }, rules] = await Promise.all([q, getRules(sb)]);
  const prev = periodOf(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  return (<>
    <PageHeader title="Thưởng thanh toán đúng hạn" jp="完納奨励金">{(role === "admin" || role === "wholesaler") && <ApiButton url="/api/incentives" body={{ period_start: prev.start, period_end: prev.end }} className="btn-dark">Tính thưởng kỳ {prev.label}</ApiButton>}</PageHeader>
    <Notice>Quy tắc (giả định, tham số hóa): bên mua thanh toán <b>đủ</b> và <b>trước hạn</b> mọi hóa đơn của kỳ → thưởng {(rules.incentiveRate * 100).toFixed(1)}% tiền hàng. Hệ thống chỉ tính và đề xuất; <b>Ban quản lý chợ duyệt</b>, sau đó được trừ vào hóa đơn kỳ kế tiếp.</Notice>
    <div className="card mt-4 overflow-x-auto"><table className="tbl">
      <thead><tr><th>Bên mua</th><th>Kỳ</th><th>Tiền hàng</th><th>Tỷ lệ</th><th>Tiền thưởng</th><th>Trạng thái</th><th></th></tr></thead>
      <tbody>{(data ?? []).map((i: any) => <tr key={i.id}><td>{i.buyer?.name}</td><td>{dateJP(i.period_start)}–{dateJP(i.period_end)}</td><td>{yen(i.base_amount)}</td><td>{(Number(i.rate) * 100).toFixed(1)}%</td><td className="font-medium">{yen(i.amount)}</td><td><StatusPill value={i.status} /></td>
        <td>{role === "admin" && i.status === "calculated" && <ApiButton url="/api/incentives" body={{ action: "approve", id: i.id }} className="btn-primary">Duyệt</ApiButton>}</td></tr>)}
        {!data?.length && <tr><td colSpan={7} className="text-ink-600">Chưa có kết quả tính. Bấm "Tính thưởng" cho kỳ trước (dữ liệu mẫu có 1 bên mua đã thanh toán đủ, đúng hạn).</td></tr>}</tbody>
    </table></div>
  </>);
}
