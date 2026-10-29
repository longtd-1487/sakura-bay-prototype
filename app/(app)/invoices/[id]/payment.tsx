"use client";
import { useState } from "react";
import { ApiButton } from "@/components/actions";
export default function PaymentForm({ invoiceId, remain }: { invoiceId: string; remain: number }) {
  const [amount, setAmount] = useState(String(remain)); const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
    <div><label className="label">Số tiền</label><input className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
    <div><label className="label">Ngày tiền về</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
    <ApiButton url="/api/payments" body={{ invoice_id: invoiceId, amount, paid_at: date }}>Ghi nhận</ApiButton>
    <p className="col-span-3 text-xs text-ink-400">Prototype nhập tay; bản thật import sao kê ngân hàng (CSV) rồi khớp tự động.</p>
  </div>;
}
