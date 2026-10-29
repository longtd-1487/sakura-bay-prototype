import type { Role } from "@/lib/types";
import { ROLE_SHORT } from "@/lib/types";

export function RolePill({ role, tier }: { role: Role; tier: number }) {
  const cls = role === "retail" ? "bg-coral-100 text-coral-600" : tier === 1 ? "bg-kelp-100 text-kelp-600" : "bg-harbor-100 text-harbor-800";
  return <span className={`pill ${cls}`}>{ROLE_SHORT[role]}{tier > 0 ? ` · cấp ${tier}` : ""}</span>;
}
export function StatusPill({ value }: { value: string }) {
  const map: Record<string, [string, string]> = {
    active: ["Hoạt động", "bg-kelp-100 text-kelp-600"], suspended: ["Đình chỉ", "bg-coral-100 text-coral-600"],
    available: ["Còn hàng", "bg-kelp-100 text-kelp-600"], sold: ["Đã bán", "bg-harbor-100 text-harbor-800"], withdrawn: ["Đã rút", "bg-harbor-100 text-ink-600"],
    pending: ["Chờ xác nhận", "bg-buoy-100 text-buoy-600"], confirmed: ["Đã chốt", "bg-kelp-100 text-kelp-600"], cancelled: ["Đã hủy", "bg-harbor-100 text-ink-600"],
    unpaid: ["Chưa thanh toán", "bg-buoy-100 text-buoy-600"], partial: ["Thanh toán một phần", "bg-buoy-100 text-buoy-600"], paid: ["Đã thanh toán", "bg-kelp-100 text-kelp-600"],
    planned: ["Chưa bắt đầu", "bg-harbor-100 text-harbor-800"], running: ["Đang diễn ra", "bg-buoy-100 text-buoy-600"], closed: ["Đã kết thúc", "bg-harbor-100 text-ink-600"],
    calculated: ["Đã tính – chờ duyệt", "bg-buoy-100 text-buoy-600"], approved: ["Đã duyệt", "bg-kelp-100 text-kelp-600"], applied: ["Đã trừ vào hóa đơn", "bg-harbor-100 text-harbor-800"],
  };
  const [t, c] = map[value] ?? [value, "bg-harbor-100 text-ink-600"];
  return <span className={`pill ${c}`}>{t}</span>;
}
export function PageHeader({ title, jp, children }: { title: string; jp?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1>{title}</h1>{jp && <div className="text-sm text-ink-400">{jp}</div>}</div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) { return <div className="card p-8 text-center text-sm text-ink-600">{children}</div>; }
export function Notice({ kind = "info", children }: { kind?: "info" | "warn" | "block"; children: React.ReactNode }) {
  const c = kind === "block" ? "border-coral-600 bg-coral-100 text-coral-600" : kind === "warn" ? "border-buoy-500 bg-buoy-100 text-buoy-600" : "border-harbor-100 bg-harbor-50 text-ink-600";
  return <div className={`rounded-md border-l-4 px-4 py-3 text-sm ${c}`}>{children}</div>;
}
