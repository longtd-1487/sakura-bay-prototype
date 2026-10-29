import { supabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import ArrivalForm from "./form";
export default async function NewArrival() {
  const sb = supabaseServer();
  const [{ data: vessels }, { data: species }] = await Promise.all([sb.from("vessels").select("id,name,owner_name").order("name"), sb.from("fish_species").select("id,name_jp,name_vn").order("name_vn")]);
  return (<><PageHeader title="Đăng ký lô nhập" jp="入荷登録 – nhập nhanh trên Tablet tại cầu cảng" /><ArrivalForm vessels={vessels ?? []} species={species ?? []} /></>);
}
