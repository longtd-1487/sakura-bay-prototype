import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { dateJP } from "@/lib/format";
export default async function Arrivals() {
  const { data } = await supabaseServer().from("arrivals").select("id,arrival_date,trade_form,note,vessel:vessels(name,owner_name),lots(count)").order("arrival_date", { ascending: false });
  return (
    <>
      <PageHeader title="Nhập hàng từ tàu" jp="入荷登録"><Link href="/arrivals/new" className="btn-primary">Đăng ký lô nhập</Link></PageHeader>
      <div className="card overflow-x-auto"><table className="tbl">
        <thead><tr><th>Ngày</th><th>Tàu</th><th>Chủ hàng</th><th>Hình thức</th><th>Số lot</th><th>Ghi chú</th></tr></thead>
        <tbody>{(data ?? []).map((a: any) => <tr key={a.id}><td>{dateJP(a.arrival_date)}</td><td>{a.vessel?.name}</td><td>{a.vessel?.owner_name}</td><td>{a.trade_form === "consignment" ? "Ký gửi (委託)" : "Mua đứt (買付)"}</td><td>{a.lots?.[0]?.count ?? 0}</td><td className="text-ink-600">{a.note}</td></tr>)}</tbody>
      </table></div>
    </>
  );
}
