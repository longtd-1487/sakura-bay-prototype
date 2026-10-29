"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Nút gọi API rồi refresh trang; hiển thị lỗi từ server ngay cạnh nút. */
export function ApiButton({ url, method = "POST", body, children, className = "btn-primary", confirm: confirmMsg, onDone }:
  { url: string; method?: string; body?: unknown; children: React.ReactNode; className?: string; confirm?: string; onDone?: (r: any) => void }) {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null); const router = useRouter();
  async function run() {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true); setErr(null);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr([data.error, ...(data.reasons ?? [])].filter(Boolean).join(" ")); return; }
    onDone?.(data); router.refresh();
  }
  return <span className="inline-flex flex-col gap-1"><button className={className} disabled={busy} onClick={run}>{busy ? "…" : children}</button>{err && <span className="text-xs text-coral-600 max-w-xs">{err}</span>}</span>;
}
