export const yen = (n: number | string | null | undefined) => (n == null ? "–" : "¥" + Number(n).toLocaleString("ja-JP"));
export const num = (n: number | string | null | undefined, d = 1) => (n == null ? "–" : Number(n).toLocaleString("ja-JP", { maximumFractionDigits: d }));
export const dateJP = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }) : "–");
export const today = () => new Date().toISOString().slice(0, 10);
export function periodOf(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1), end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return { start: f(start), end: f(end), label: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}` };
}
