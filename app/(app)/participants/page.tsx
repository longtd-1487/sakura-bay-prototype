import { getCurrentProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader, RolePill, StatusPill, Notice } from "@/components/ui";
import { ApiButton } from "@/components/actions";
import { yen } from "@/lib/format";
import { redirect } from "next/navigation";
import type { Participant } from "@/lib/types";

export default async function Participants() {
  const me = await getCurrentProfile(); if (me?.participant?.role !== "admin") redirect("/dashboard");
  const { data } = await supabaseServer().from("participants").select("*").order("role").order("code");
  const list = (data ?? []) as Participant[];
  return (
    <>
      <PageHeader title="Thành viên chợ & phân quyền" jp="市場参加者・権限管理" />
      <Notice>Hai cấp quyền mua theo Luật chợ bán buôn: <b>cấp 1</b> (仲卸, 売買参加者) mua trực tiếp từ công ty bán buôn; <b>cấp 2</b> (買出人) chỉ mua lại từ công ty trung gian. Đình chỉ (取引停止) chặn mọi giao dịch mới ngay lập tức.</Notice>
      <div className="card mt-5 overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Mã</th><th>Tên</th><th>Vai trò · cấp</th><th>Số phép</th><th>Hạn mức</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{list.map((p) => (
            <tr key={p.id}>
              <td className="font-mono text-xs">{p.code}</td><td>{p.name}{p.parent_intermediate_id && <div className="text-xs text-ink-400">mua qua: {list.find((x) => x.id === p.parent_intermediate_id)?.name}</div>}</td>
              <td><RolePill role={p.role} tier={p.tier} /></td><td>{p.license_no ?? "–"}</td><td>{p.tier === 1 ? yen(p.credit_limit) : "–"}</td><td><StatusPill value={p.status} /></td>
              <td>{p.tier > 0 && (p.status === "active"
                ? <ApiButton url={`/api/participants/${p.id}`} method="PATCH" body={{ status: "suspended" }} className="btn-ghost text-coral-600" confirm={`Đình chỉ giao dịch ${p.name}?`}>Đình chỉ</ApiButton>
                : <ApiButton url={`/api/participants/${p.id}`} method="PATCH" body={{ status: "active" }} className="btn-ghost">Khôi phục</ApiButton>)}</td>
            </tr>))}</tbody>
        </table>
      </div>
    </>
  );
}
