import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader, StatusPill } from "@/components/ui";
import { CHANNEL_LABEL } from "@/lib/types";
import { num, dateJP } from "@/lib/format";
export default async function Lots() {
  const { data } = await supabaseServer().from("v_lots").select("*").order("arrival_date", { ascending: false }).order("lot_no");
  return (
    <>
      <PageHeader title="Lot & thẩm định độ tươi" jp="ロット一覧・目利き・符丁" />
      <div className="card overflow-x-auto"><table className="tbl">
        <thead><tr><th>Lot</th><th>Ngày</th><th>Tàu</th><th>Loại cá</th><th>Số lượng</th><th>Quy cách</th><th>Độ tươi</th><th>Ký hiệu</th><th>Kênh bán</th><th>Trạng thái</th></tr></thead>
        <tbody>{(data ?? []).map((l: any) => <tr key={l.id}>
          <td><Link href={`/lots/${l.id}`} className="font-medium text-buoy-600 hover:underline">{l.lot_no}</Link></td><td>{dateJP(l.arrival_date)}</td><td>{l.vessel_name}</td>
          <td>{l.species_vn} <span className="text-ink-400 text-xs">{l.species_jp}</span></td><td>{num(l.quantity)} kg</td><td>{l.size_grade}</td>
          <td>{l.freshness_rank ? <span className="pill bg-harbor-100 text-harbor-800">{l.freshness_rank}</span> : <span className="text-xs text-buoy-600">chưa chấm</span>}</td>
          <td className="text-lg">{l.market_mark ?? "–"}</td><td>{CHANNEL_LABEL[l.channel]}</td><td><StatusPill value={l.status} /></td></tr>)}</tbody>
      </table></div>
    </>
  );
}
