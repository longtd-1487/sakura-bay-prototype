"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const MARKS = ["◎", "○", "△", "★", "×"];
export default function AssessForm({ lot }: { lot: any }) {
  const router = useRouter();
  const [rank, setRank] = useState(lot.freshness_rank ?? ""); const [note, setNote] = useState(lot.freshness_note ?? ""); const [mark, setMark] = useState(lot.market_mark ?? "");
  const [channel, setChannel] = useState(lot.channel); const [msg, setMsg] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  async function save(body: any, done: string) {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/lots/${lot.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); setBusy(false); setMsg(res.ok ? done : d.error); router.refresh();
  }
  return (
    <div className="card p-5 space-y-5">
      <div>
        <div className="font-semibold mb-2">Chấm độ tươi (目利き) – nhìn cá rồi chọn</div>
        <div className="grid grid-cols-4 gap-2">{["S", "A", "B", "C"].map((r) => <button key={r} type="button" onClick={() => setRank(r)} className={`h-16 rounded-md text-2xl font-bold border ${rank === r ? "bg-harbor-900 text-white border-harbor-900" : "bg-white border-harbor-100 hover:bg-harbor-50"}`}>{r}</button>)}</div>
        <input className="input mt-2" placeholder="Ghi chú (mắt, mang, độ đàn hồi…)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div>
        <div className="font-semibold mb-2">Ký hiệu riêng của chợ (符丁)</div>
        <div className="flex gap-2">{MARKS.map((m) => <button key={m} type="button" onClick={() => setMark(m)} className={`h-12 w-12 rounded-md text-xl border ${mark === m ? "bg-buoy-500 text-white border-buoy-500" : "bg-white border-harbor-100"}`}>{m}</button>)}</div>
        <button className="btn-dark mt-3" disabled={busy || !rank} onClick={() => save({ freshness_rank: rank, freshness_note: note, market_mark: mark }, "Đã lưu kết quả thẩm định.")}>Lưu thẩm định</button>
      </div>
      <div>
        <div className="font-semibold mb-2">Chia kênh bán (振分)</div>
        <div className="flex gap-2 flex-wrap">{[["negotiation", "Thỏa thuận (相対)"], ["auction", "Đấu giá (せり)"], ["held", "Giữ lại"]].map(([v, l]) => <button key={v} type="button" onClick={() => setChannel(v)} className={`btn ${channel === v ? "bg-kelp-600 text-white" : "btn-ghost"}`}>{l}</button>)}</div>
        <button className="btn-primary mt-3" disabled={busy || channel === "pending"} onClick={() => save({ channel }, "Đã chia kênh bán.")}>Lưu kênh bán</button>
      </div>
      {msg && <p className="text-sm text-kelp-600">{msg}</p>}
    </div>
  );
}
