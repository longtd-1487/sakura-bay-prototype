import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { PageHeader, Notice } from "@/components/ui";
import NegotiationForm from "./form";
export default async function NewNegotiation() {
  const me = await getCurrentProfile(); if (me?.participant?.role !== "wholesaler") redirect("/negotiations");
  const sb = supabaseServer();
  const [{ data: lots }, { data: buyers }] = await Promise.all([
    sb.from("v_lots").select("id,lot_no,species_vn,quantity,freshness_rank,channel").eq("status", "available").in("channel", ["negotiation", "pending"]).order("lot_no"),
    sb.from("participants").select("id,name,role,tier,status,credit_limit").in("role", ["intermediate", "participant", "retail"]).order("tier").order("name"),
  ]);
  return (<>
    <PageHeader title="Ghi nhận giao dịch thỏa thuận" jp="相対取引登録 – hai bên đã thỏa thuận bằng lời, người bán ghi lại tại sàn" />
    <Notice>Trước khi lưu, hệ thống kiểm tra bên mua theo quy tắc vận hành của chợ: phải là cấp 1, không bị đình chỉ, không vượt hạn mức. Danh sách có cả người mua lẻ để bạn thấy hệ thống chặn thế nào.</Notice>
    <div className="mt-4"><NegotiationForm lots={lots ?? []} buyers={buyers ?? []} /></div>
  </>);
}
