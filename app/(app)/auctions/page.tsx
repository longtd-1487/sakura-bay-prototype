import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader, StatusPill, Notice } from "@/components/ui";
import { dateJP } from "@/lib/format";
export default async function Auctions() {
  const { data } = await supabaseServer().from("auction_sessions").select("id,session_date,session_no,status,auctioneer:participants(name),auction_lots(count)").order("session_date", { ascending: false });
  return (<>
    <PageHeader title="Phiên đấu giá tại sàn" jp="せり – đấu giá vẫn diễn ra bằng tay, hệ thống chỉ ghi kết quả" />
    <Notice>Phiên đấu giá của ngày được lập sẵn từ các lot đã chia kênh "Đấu giá". Người điều khiển (競り人) mở phiên và nhập kết quả từng lot trên Tablet.</Notice>
    <div className="card mt-4 overflow-x-auto"><table className="tbl">
      <thead><tr><th>Ngày</th><th>Phiên</th><th>Người điều khiển</th><th>Số lot</th><th>Trạng thái</th><th></th></tr></thead>
      <tbody>{(data ?? []).map((s: any) => <tr key={s.id}><td>{dateJP(s.session_date)}</td><td>#{s.session_no}</td><td>{s.auctioneer?.name}</td><td>{s.auction_lots?.[0]?.count ?? 0}</td><td><StatusPill value={s.status} /></td><td><Link className="btn-ghost" href={`/auctions/${s.id}`}>{s.status === "closed" ? "Xem kết quả" : "Mở màn hình nhập kết quả"}</Link></td></tr>)}</tbody>
    </table></div>
  </>);
}
