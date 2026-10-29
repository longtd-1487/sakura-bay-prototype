"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
/** Nhập kết quả trúng giá: tối giản cho Tablet – chọn người, nhập giá, chốt trong vài giây (US-08). */
export default function ResultEntry({ sessionId, lot, buyers }: { sessionId: string; lot: any; buyers: any[] }) {
  const router = useRouter(); const [buyer, setBuyer] = useState(""); const [price, setPrice] = useState(""); const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  async function send(body: any) {
    setBusy(true); setErr(null);
    const res = await fetch(`/api/auctions/${sessionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lot_id: lot.id, ...body }) });
    const d = await res.json(); setBusy(false);
    if (!res.ok) { setErr([d.error, ...(d.reasons ?? [])].join(" ")); return; }
    router.refresh();
  }
  return (
    <div className="flex flex-wrap gap-2 items-start">
      <div className="flex flex-wrap gap-1 max-w-sm">{buyers.map((b) => <button key={b.id} type="button" onClick={() => setBuyer(b.id)} disabled={b.status === "suspended"} className={`rounded-md border px-3 py-2 text-sm ${buyer === b.id ? "bg-harbor-900 text-white border-harbor-900" : "bg-white border-harbor-100"} disabled:opacity-40`}>{b.name.split(" (")[0]}</button>)}</div>
      <input className="input w-28 text-lg" placeholder="¥/kg" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button className="btn-primary h-11" disabled={busy || !buyer || !price} onClick={() => send({ buyer_id: buyer, unit_price: price })}>Chốt trúng giá</button>
      <button className="btn-ghost h-11" disabled={busy} onClick={() => send({ unsold: true })}>Không ai mua</button>
      {err && <div className="basis-full text-xs text-coral-600">{err}</div>}
    </div>
  );
}
