import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, StatusPill, Notice } from "@/components/ui";
import { num, dateJP } from "@/lib/format";
import AssessForm from "./form";
export default async function LotDetail({ params }: { params: { id: string } }) {
  const me = await getCurrentProfile();
  const { data: lot } = await supabaseServer().from("v_lots").select("*").eq("id", params.id).single();
  if (!lot) notFound();
  const canEdit = me?.participant?.role === "wholesaler" || me?.participant?.role === "admin";
  return (
    <>
      <PageHeader title={`Lot ${lot.lot_no} · ${lot.species_vn}`} jp={`${lot.species_jp} · ${lot.vessel_name} · ${dateJP(lot.arrival_date)}`}><StatusPill value={lot.status} /></PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="card p-5 text-sm space-y-2">
          <Row k="Số lượng" v={`${num(lot.quantity)} kg`} /><Row k="Quy cách (規格)" v={lot.size_grade ?? "–"} />
          <Row k="Hạng độ tươi (鮮度)" v={lot.freshness_rank ?? "chưa chấm"} /><Row k="Ghi chú thẩm định" v={lot.freshness_note ?? "–"} />
          <Row k="Ký hiệu riêng (符丁)" v={lot.market_mark ?? "–"} /><Row k="Thẩm định lúc" v={lot.assessed_at ? new Date(lot.assessed_at).toLocaleString("ja-JP") : "–"} />
        </section>
        <section className="space-y-4">
          <Notice>Độ tươi do người thẩm định nhìn và quyết định; hệ thống chỉ lưu lại kết quả cùng thời điểm và người chấm. Không có bước máy tự đánh giá.</Notice>
          {canEdit && lot.status === "available" ? <AssessForm lot={lot} /> : <p className="text-sm text-ink-600">Chỉ công ty bán buôn mới thẩm định và chia kênh bán.</p>}
        </section>
      </div>
    </>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-4 border-b border-harbor-100 py-1.5 last:border-0"><span className="text-ink-600">{k}</span><span className="font-medium text-right">{v}</span></div>; }
