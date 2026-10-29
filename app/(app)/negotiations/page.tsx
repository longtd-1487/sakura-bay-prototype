import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, StatusPill, Notice } from "@/components/ui";
import { ApiButton } from "@/components/actions";
import { yen, num, dateJP } from "@/lib/format";
import ConfirmVerbal from "./confirm-verbal";
export default async function Negotiations() {
  const me = await getCurrentProfile(); const role = me?.participant?.role;
  const { data } = await supabaseServer().from("v_transactions").select("*").eq("trade_type", "negotiation").order("created_at", { ascending: false });
  return (
    <>
      <PageHeader title="Giao dịch thỏa thuận" jp="相対取引 – luồng chiếm phần lớn giá trị của chợ">{role === "wholesaler" && <Link href="/negotiations/new" className="btn-primary">Ghi nhận thỏa thuận</Link>}</PageHeader>
      {role !== "wholesaler" && <Notice>Bạn là bên mua: giao dịch của bạn đang chờ sẽ có nút <b>Xác nhận</b>. Nếu bạn đã xác nhận miệng tại sàn, công ty bán buôn ghi lại giúp bạn.</Notice>}
      <div className="card mt-4 overflow-x-auto"><table className="tbl">
        <thead><tr><th>Ngày</th><th>Lot</th><th>Loại cá</th><th>Bên mua</th><th>Giá/kg</th><th>SL</th><th>Thành tiền</th><th>Trạng thái</th><th>Xác nhận</th></tr></thead>
        <tbody>{(data ?? []).map((t: any) => <tr key={t.id}>
          <td>{dateJP(t.trade_date)}</td><td className="font-medium">{t.lot_no}</td><td>{t.species_vn}</td><td>{t.buyer_name}</td><td>{yen(t.unit_price)}</td><td>{num(t.quantity)}</td><td className="font-medium">{yen(t.amount)}</td>
          <td><StatusPill value={t.status} />{t.confirm_method && <div className="text-xs text-ink-400">{t.confirm_method === "app" ? "xác nhận trên app" : `xác nhận miệng: ${t.confirmed_by_name}`}</div>}</td>
          <td>{t.status === "pending" && (role === "wholesaler" ? <ConfirmVerbal id={t.id} /> : me?.participant?.id === t.buyer_id ? <ApiButton url={`/api/negotiations/${t.id}`} body={{}}>Xác nhận</ApiButton> : null)}</td>
        </tr>)}</tbody>
      </table></div>
    </>
  );
}
