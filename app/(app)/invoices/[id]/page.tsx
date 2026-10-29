import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, StatusPill } from "@/components/ui";
import { yen, num, dateJP } from "@/lib/format";
import PaymentForm from "./payment";
export default async function InvoiceDetail({ params }: { params: { id: string } }) {
  const me = await getCurrentProfile(); const sb = supabaseServer();
  const { data: inv } = await sb.from("invoices").select("*,buyer:participants(name,role)").eq("id", params.id).single(); if (!inv) notFound();
  const [{ data: lines }, { data: pays }] = await Promise.all([sb.from("v_transactions").select("*").eq("invoice_id", params.id).order("trade_date"), sb.from("payments").select("*").eq("invoice_id", params.id).order("paid_at")]);
  const remain = Number(inv.total) - Number(inv.paid_amount); const canPay = me?.participant?.role === "wholesaler" || me?.participant?.role === "admin";
  return (<>
    <PageHeader title={`Hóa đơn ${inv.invoice_no}`} jp={`請求書 · ${inv.buyer?.name}`}><StatusPill value={inv.status} /></PageHeader>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card overflow-x-auto"><table className="tbl">
        <thead><tr><th>Ngày</th><th>Lot</th><th>Loại cá</th><th>Hình thức</th><th>Giá</th><th>SL</th><th>Tiền</th></tr></thead>
        <tbody>{(lines ?? []).map((t: any) => <tr key={t.id}><td>{dateJP(t.trade_date)}</td><td>{t.lot_no}</td><td>{t.species_vn}</td><td>{t.trade_type === "auction" ? "Đấu giá" : "Thỏa thuận"}</td><td>{yen(t.unit_price)}</td><td>{num(t.quantity)}</td><td>{yen(t.amount)}</td></tr>)}
          {!lines?.length && <tr><td colSpan={7} className="text-ink-600">Hóa đơn mẫu – không có dòng giao dịch chi tiết (dữ liệu mock).</td></tr>}</tbody>
      </table></section>
      <section className="space-y-4">
        <div className="card p-5 text-sm space-y-1.5">
          <Row k="Tiền hàng" v={yen(inv.subtotal)} /><Row k="Phí hoa hồng (手数料)" v={yen(inv.fee)} /><Row k="Trừ thưởng kỳ trước (奨励金)" v={inv.incentive_deduction > 0 ? "−" + yen(inv.incentive_deduction) : "–"} />
          <Row k="Tổng phải trả" v={yen(inv.total)} bold /><Row k="Hạn thanh toán" v={dateJP(inv.due_date)} /><Row k="Đã trả" v={yen(inv.paid_amount)} /><Row k="Còn lại" v={yen(remain)} bold />
        </div>
        <div className="card p-5"><div className="font-semibold mb-2">Tiền về (入金)</div>
          {pays?.length ? <ul className="text-sm divide-y divide-harbor-100">{pays.map((p: any) => <li key={p.id} className="py-1.5 flex justify-between"><span>{dateJP(p.paid_at)} · chuyển khoản</span><span>{yen(p.amount)}</span></li>)}</ul> : <p className="text-sm text-ink-600">Chưa có tiền về.</p>}
          {canPay && remain > 0 && <PaymentForm invoiceId={inv.id} remain={remain} />}
        </div>
      </section>
    </div>
  </>);
}
function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) { return <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}><span className="text-ink-600">{k}</span><span>{v}</span></div>; }
