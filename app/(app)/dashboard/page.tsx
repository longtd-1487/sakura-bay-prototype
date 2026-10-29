import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader, Notice } from "@/components/ui";
import { yen, today } from "@/lib/format";

export default async function Dashboard() {
  const profile = (await getCurrentProfile())!; const sb = supabaseServer(); const me = profile.participant;
  const [{ count: lotsToday }, { data: txToday }, { data: pending }, { data: unpaid }] = await Promise.all([
    sb.from("v_lots").select("id", { count: "exact", head: true }).eq("arrival_date", today()),
    sb.from("v_transactions").select("amount,trade_type").eq("trade_date", today()).eq("status", "confirmed"),
    sb.from("v_transactions").select("id,lot_no,species_vn,buyer_name,amount").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
    sb.from("invoices").select("id,invoice_no,total,paid_amount,due_date,buyer_id").neq("status", "paid").order("due_date"),
  ]);
  const neg = (txToday ?? []).filter((t) => t.trade_type === "negotiation").reduce((s, t) => s + Number(t.amount), 0);
  const auc = (txToday ?? []).filter((t) => t.trade_type === "auction").reduce((s, t) => s + Number(t.amount), 0);
  const myUnpaid = (unpaid ?? []).filter((i) => !me || me.tier === 0 || i.buyer_id === me.id);
  return (
    <>
      <PageHeader title={`Xin chào, ${profile.display_name}`} jp={today()} />
      {me?.role === "retail" && <Notice kind="warn">Bạn là người mua lẻ (買出人, cấp 2): chỉ xem được kết quả công bố và mua lại từ công ty trung gian. Hệ thống không cho phép giao dịch trực tiếp với công ty bán buôn.</Notice>}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Stat label="Lot nhập hôm nay" value={String(lotsToday ?? 0)} href="/lots" />
        <Stat label="Giá trị thỏa thuận hôm nay (相対)" value={yen(neg)} href="/negotiations" accent />
        <Stat label="Giá trị đấu giá hôm nay (せり)" value={yen(auc)} href="/auctions" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold mb-3">Giao dịch chờ xác nhận</h2>
          {pending?.length ? <ul className="divide-y divide-harbor-100 text-sm">{pending.map((t) => <li key={t.id} className="py-2 flex justify-between"><span>{t.lot_no} · {t.species_vn} → {t.buyer_name}</span><span>{yen(t.amount)}</span></li>)}</ul> : <p className="text-sm text-ink-600">Không có giao dịch nào đang chờ.</p>}
          <Link href="/negotiations" className="mt-3 inline-block text-sm text-buoy-600 hover:underline">Mở danh sách thỏa thuận</Link>
        </section>
        <section className="card p-5">
          <h2 className="font-semibold mb-3">Hóa đơn chưa thanh toán</h2>
          {myUnpaid.length ? <ul className="divide-y divide-harbor-100 text-sm">{myUnpaid.map((i) => <li key={i.id} className="py-2 flex justify-between"><span>{i.invoice_no} · hạn {i.due_date}</span><span>{yen(Number(i.total) - Number(i.paid_amount))}</span></li>)}</ul> : <p className="text-sm text-ink-600">Không có hóa đơn nào còn nợ.</p>}
          <Link href="/invoices" className="mt-3 inline-block text-sm text-buoy-600 hover:underline">Mở hóa đơn & tiền về</Link>
        </section>
      </div>
      <p className="mt-6 text-xs text-ink-400">Số liệu lấy trực tiếp từ Supabase; dữ liệu là bộ mock đổ sẵn cho prototype.</p>
    </>
  );
}
function Stat({ label, value, href, accent }: { label: string; value: string; href: string; accent?: boolean }) {
  return <Link href={href} className={`card p-5 block hover:border-buoy-500 ${accent ? "border-l-4 border-l-buoy-500" : ""}`}><div className="text-sm text-ink-600">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></Link>;
}
