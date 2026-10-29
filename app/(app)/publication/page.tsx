import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader, Notice } from "@/components/ui";
import { yen, num, dateJP } from "@/lib/format";
export default async function Publication({ searchParams }: { searchParams: { date?: string } }) {
  const sb = supabaseServer();
  const { data: dates } = await sb.from("transactions").select("trade_date").eq("status", "confirmed").order("trade_date", { ascending: false });
  const uniq = Array.from(new Set((dates ?? []).map((d) => d.trade_date))); const date = searchParams.date ?? uniq[0];
  const { data: tx } = await sb.from("v_transactions").select("species_vn,species_jp,trade_type,unit_price,quantity,amount").eq("status", "confirmed").eq("trade_date", date ?? "1900-01-01");
  const groups = new Map<string, { jp: string; qty: number; amt: number; max: number; min: number; n: number }>();
  for (const t of tx ?? []) { const g = groups.get(t.species_vn) ?? { jp: t.species_jp, qty: 0, amt: 0, max: 0, min: Infinity, n: 0 }; g.qty += Number(t.quantity); g.amt += Number(t.amount); g.max = Math.max(g.max, Number(t.unit_price)); g.min = Math.min(g.min, Number(t.unit_price)); g.n += 1; groups.set(t.species_vn, g); }
  return (<>
    <PageHeader title="Công bố kết quả giao dịch" jp="取引結果公表 – nghĩa vụ theo Luật chợ bán buôn" />
    <Notice>Tổng hợp cả thỏa thuận (相対) và đấu giá (せり) đã chốt theo ngày: số lượng, giá cao nhất / thấp nhất / bình quân theo loại cá. Prototype hiển thị trong app; bản thật xuất PDF và trang công khai.</Notice>
    <form className="mt-4 flex items-center gap-2 text-sm"><label>Ngày</label><select name="date" className="input w-44" defaultValue={date}>{uniq.map((d) => <option key={d} value={d}>{dateJP(d)}</option>)}</select><button className="btn-ghost">Xem</button></form>
    <div className="card mt-4 overflow-x-auto"><table className="tbl">
      <thead><tr><th>Loại cá</th><th>Số giao dịch</th><th>Số lượng (kg)</th><th>Giá cao nhất</th><th>Giá thấp nhất</th><th>Bình quân</th><th>Giá trị</th></tr></thead>
      <tbody>{Array.from(groups.entries()).map(([k, g]) => <tr key={k}><td>{k} <span className="text-ink-400 text-xs">{g.jp}</span></td><td>{g.n}</td><td>{num(g.qty)}</td><td>{yen(g.max)}</td><td>{yen(g.min)}</td><td>{yen(Math.round(g.amt / g.qty))}</td><td className="font-medium">{yen(g.amt)}</td></tr>)}
        {!groups.size && <tr><td colSpan={7} className="text-ink-600">Không có giao dịch đã chốt trong ngày này.</td></tr>}</tbody>
    </table></div>
  </>);
}
