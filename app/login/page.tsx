"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const DEMO = [
  ["admin@sakura-bay.demo", "Ban quản lý chợ"], ["oroshi@sakura-bay.demo", "Công ty bán buôn"], ["nakaoroshi@sakura-bay.demo", "Công ty trung gian (cấp 1)"],
  ["sanka@sakura-bay.demo", "Người mua được cấp phép (cấp 1)"], ["kaidashi@sakura-bay.demo", "Người mua lẻ (cấp 2)"],
];
function LoginForm() {
  const [email, setEmail] = useState("oroshi@sakura-bay.demo"); const [pw, setPw] = useState("Demo1234!");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const router = useRouter(); const next = useSearchParams().get("next") || "/dashboard";
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) { setErr("Email hoặc mật khẩu không đúng."); return; }
    router.replace(next); router.refresh();
  }
  return (
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden lg:flex flex-col justify-between bg-harbor-900 text-white p-12">
        <div className="text-sm text-harbor-100">サクラ湾水産卸売市場 取引支援システム</div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Chợ thủy sản<br />Vịnh Sakura</h1>
          <p className="mt-4 max-w-md text-harbor-100">Ghi nhận nhập hàng, thỏa thuận tay đôi, kết quả đấu giá, hóa đơn và thưởng thanh toán đúng hạn – theo quy tắc vận hành riêng của chợ.</p>
        </div>
        <div className="text-xs text-harbor-100">Prototype LAB-2 · Dữ liệu mẫu, không phải dữ liệu thật</div>
      </section>
      <section className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h2 className="text-xl font-semibold">Đăng nhập</h2>
          <div><label className="label">Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" /></div>
          <div><label className="label">Mật khẩu</label><input className="input" value={pw} onChange={(e) => setPw(e.target.value)} type="password" autoComplete="current-password" /></div>
          {err && <p className="text-sm text-coral-600">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
          <div className="card p-3 text-xs text-ink-600">
            <div className="mb-1 font-medium text-ink-900">Tài khoản demo (mật khẩu chung: Demo1234!)</div>
            <ul className="space-y-0.5">{DEMO.map(([e, r]) => <li key={e}><button type="button" className="text-buoy-600 hover:underline" onClick={() => setEmail(e)}>{e}</button> – {r}</li>)}</ul>
          </div>
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() { return <Suspense><LoginForm /></Suspense>; }
