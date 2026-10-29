import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, StatusPill } from "@/components/ui";
import { ApiButton } from "@/components/actions";
import { dateJP, yen, num } from "@/lib/format";
import ResultEntry from "./entry";
export default async function AuctionDetail({ params }: { params: { id: string } }) {
  const me = await getCurrentProfile(); const sb = supabaseServer();
  const { data: s } = await sb.from("auction_sessions").select("*").eq("id", params.id).single(); if (!s) notFound();
  const [{ data: al }, { data: results }, { data: buyers }] = await Promise.all([
    sb.from("auction_lots").select("seq,lot:v_lots(*)").eq("session_id", params.id).order("seq"),
    sb.from("v_transactions").select("*").eq("session_id", params.id),
    sb.from("participants").select("id,name,tier,status").eq("tier", 1).order("name"),
  ]);
  const lots = (al ?? []).map((x: any) => ({ seq: x.seq, ...(Array.isArray(x.lot) ? x.lot[0] : x.lot) }));
  const isAuctioneer = me?.participant?.role === "wholesaler";
  return (<>
    <PageHeader title={`Phiên đấu giá ${dateJP(s.session_date)} #${s.session_no}`} jp="せり進行・落札入力"><StatusPill value={s.status} />
      {isAuctioneer && s.status === "planned" && <ApiButton url={`/api/auctions/${s.id}`} method="PATCH" body={{ status: "running" }} className="btn-dark">Bắt đầu phiên</ApiButton>}
      {isAuctioneer && s.status === "running" && <ApiButton url={`/api/auctions/${s.id}`} method="PATCH" body={{ status: "closed" }} className="btn-ghost" confirm="Kết thúc phiên? Lot chưa bán sẽ chuyển sang thỏa thuận.">Kết thúc phiên</ApiButton>}
    </PageHeader>
    <div className="space-y-3">{lots.map((l: any) => {
      const r = (results ?? []).find((t: any) => t.lot_id === l.id);
      return <div key={l.id} className="card p-4 grid gap-4 md:grid-cols-[auto_1fr_auto] items-center">
        <div className="text-3xl font-bold text-harbor-900 w-12 text-center">{l.seq}</div>
        <div><div className="font-semibold">{l.lot_no} · {l.species_vn} <span className="text-ink-400 text-sm">{l.species_jp}</span></div><div className="text-sm text-ink-600">{num(l.quantity)} kg · {l.size_grade} · độ tươi {l.freshness_rank ?? "?"} · {l.market_mark ?? ""}</div></div>
        <div>{r ? <div className="text-right"><div className="text-xs text-ink-600">Trúng giá</div><div className="font-semibold">{r.buyer_name}</div><div>{yen(r.unit_price)}/kg · {yen(r.amount)}</div></div>
          : l.status !== "available" || l.channel !== "auction" ? <span className="text-sm text-ink-600">Không bán được – đã chuyển sang thỏa thuận</span>
          : isAuctioneer && s.status === "running" ? <ResultEntry sessionId={s.id} lot={l} buyers={buyers ?? []} /> : <span className="text-sm text-ink-400">Chưa có kết quả</span>}</div>
      </div>; })}</div>
  </>);
}
