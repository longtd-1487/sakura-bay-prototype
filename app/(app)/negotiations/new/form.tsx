"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function NegotiationForm({ lots, buyers }: { lots: any[]; buyers: any[] }) {
  const router = useRouter();
  const [lot, setLot] = useState(lots[0]?.id ?? ""); const [buyer, setBuyer] = useState(buyers[0]?.id ?? "");
  const [price, setPrice] = useState(""); const [qty, setQty] = useState(String(lots[0]?.quantity ?? ""));
  const [check, setCheck] = useState<{ ok: boolean; reasons: string[]; outstanding: number } | null>(null);
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const sel = lots.find((l) => l.id === lot); const b = buyers.find((x) => x.id === buyer);
  useEffect(() => { // kiểm tra quyền ngay khi đổi bên mua / giá (dry run)
    if (!lot || !buyer || !price || !qty) { setCheck(null); return; }
    const t = setTimeout(async () => {
      const res = await fetch("/api/negotiations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lot_id: lot, buyer_id: buyer, unit_price: price, quantity: qty, dry_run: true }) });
      if (res.ok) setCheck(await res.json());
    }, 300); return () => clearTimeout(t);
  }, [lot, buyer, price, qty]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const res = await fetch("/api/negotiations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lot_id: lot, buyer_id: buyer, unit_price: price, quantity: qty }) });
    const d = await res.json(); setBusy(false);
    if (!res.ok) { setErr([d.error, ...(d.reasons ?? [])].join(" ")); return; }
    router.push("/negotiations"); router.refresh();
  }
  const amount = Number(price || 0) * Number(qty || 0);
  return (
    <form onSubmit={submit} className="card p-6 max-w-2xl space-y-5">
      <div><label className="label">Lot</label><select className="input" value={lot} onChange={(e) => { setLot(e.target.value); setQty(String(lots.find((l) => l.id === e.target.value)?.quantity ?? "")); }}>{lots.map((l) => <option key={l.id} value={l.id}>{l.lot_no} · {l.species_vn} · {l.quantity} kg · độ tươi {l.freshness_rank ?? "?"}</option>)}</select></div>
      <div><label className="label">Bên mua</label><select className="input" value={buyer} onChange={(e) => setBuyer(e.target.value)}>{buyers.map((x) => <option key={x.id} value={x.id}>{x.name} – cấp {x.tier}{x.status === "suspended" ? " (đình chỉ)" : ""}</option>)}</select></div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="label">Giá / kg (JPY)</label><input className="input text-lg" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
        <div><label className="label">Số lượng (kg)</label><input className="input text-lg" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} required /></div>
        <div><label className="label">Thành tiền</label><div className="text-lg font-semibold py-2">¥{amount.toLocaleString("ja-JP")}</div></div>
      </div>
      {check && (check.ok
        ? <div className="rounded-md border-l-4 border-kelp-600 bg-kelp-100 px-4 py-3 text-sm text-kelp-600">Bên mua đủ điều kiện. Công nợ hiện tại ¥{check.outstanding.toLocaleString("ja-JP")} / hạn mức ¥{Number(b?.credit_limit ?? 0).toLocaleString("ja-JP")}.</div>
        : <div className="rounded-md border-l-4 border-coral-600 bg-coral-100 px-4 py-3 text-sm text-coral-600"><div className="font-semibold mb-1">Không thể chốt với bên mua này</div><ul className="list-disc pl-5 space-y-0.5">{check.reasons.map((r) => <li key={r}>{r}</li>)}</ul></div>)}
      {err && <p className="text-sm text-coral-600">{err}</p>}
      <button className="btn-primary" disabled={busy || (check ? !check.ok : false)}>{busy ? "Đang lưu…" : "Lưu – chờ bên mua xác nhận"}</button>
      {sel && <p className="text-xs text-ink-400">Sau khi lưu, bên mua bấm xác nhận trên app hoặc bạn ghi "xác nhận miệng" kèm tên tại danh sách.</p>}
    </form>
  );
}
