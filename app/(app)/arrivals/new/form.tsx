"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Opt = { id: string; name_vn?: string; name_jp?: string; name?: string; owner_name?: string };
export default function ArrivalForm({ vessels, species }: { vessels: Opt[]; species: Opt[] }) {
  const router = useRouter();
  const [vessel, setVessel] = useState(vessels[0]?.id ?? ""); const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState("consignment"); const [note, setNote] = useState("");
  const [lots, setLots] = useState([{ species_id: species[0]?.id ?? "", quantity: "", size_grade: "M" }]);
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const res = await fetch("/api/arrivals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vessel_id: vessel, arrival_date: date, trade_form: form, note, lots }) });
    const d = await res.json(); setBusy(false);
    if (!res.ok) { setErr(d.error); return; }
    router.push("/lots"); router.refresh();
  }
  return (
    <form onSubmit={submit} className="card p-6 max-w-2xl space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div><label className="label">Tàu</label><select className="input" value={vessel} onChange={(e) => setVessel(e.target.value)}>{vessels.map((v) => <option key={v.id} value={v.id}>{v.name} – {v.owner_name}</option>)}</select></div>
        <div><label className="label">Ngày cập cảng</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="label">Hình thức</label><select className="input" value={form} onChange={(e) => setForm(e.target.value)}><option value="consignment">Ký gửi (委託)</option><option value="purchase">Mua đứt (買付)</option></select></div>
      </div>
      <div>
        <div className="flex justify-between items-end mb-2"><label className="label mb-0">Các lot</label><button type="button" className="btn-ghost text-xs" onClick={() => setLots([...lots, { species_id: species[0]?.id ?? "", quantity: "", size_grade: "M" }])}>Thêm lot</button></div>
        <div className="space-y-2">{lots.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_90px_auto] gap-2">
            <select className="input" value={l.species_id} onChange={(e) => setLots(lots.map((x, j) => j === i ? { ...x, species_id: e.target.value } : x))}>{species.map((s) => <option key={s.id} value={s.id}>{s.name_vn} ({s.name_jp})</option>)}</select>
            <input className="input" placeholder="kg" inputMode="decimal" value={l.quantity} onChange={(e) => setLots(lots.map((x, j) => j === i ? { ...x, quantity: e.target.value } : x))} required />
            <select className="input" value={l.size_grade} onChange={(e) => setLots(lots.map((x, j) => j === i ? { ...x, size_grade: e.target.value } : x))}>{["S", "M", "L", "LL"].map((g) => <option key={g}>{g}</option>)}</select>
            <button type="button" className="btn-ghost" onClick={() => setLots(lots.filter((_, j) => j !== i))} disabled={lots.length === 1}>Xóa</button>
          </div>))}</div>
      </div>
      <div><label className="label">Ghi chú (tàu báo qua điện thoại / fax)</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      {err && <p className="text-sm text-coral-600">{err}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu lô nhập"}</button>
    </form>
  );
}
