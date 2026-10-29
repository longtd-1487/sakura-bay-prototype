import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Tổng quan", roles: ["admin", "wholesaler", "intermediate", "participant", "retail"] },
  { href: "/participants", label: "Thành viên & phân quyền", jp: "市場参加者", roles: ["admin"] },
  { href: "/arrivals", label: "Nhập hàng", jp: "入荷", roles: ["admin", "wholesaler"] },
  { href: "/lots", label: "Lot & thẩm định", jp: "ロット・目利き", roles: ["admin", "wholesaler", "intermediate", "participant"] },
  { href: "/negotiations", label: "Giao dịch thỏa thuận", jp: "相対取引", roles: ["admin", "wholesaler", "intermediate", "participant"] },
  { href: "/auctions", label: "Phiên đấu giá", jp: "せり", roles: ["admin", "wholesaler", "intermediate", "participant"] },
  { href: "/invoices", label: "Hóa đơn & tiền về", jp: "請求・入金", roles: ["admin", "wholesaler", "intermediate", "participant"] },
  { href: "/incentives", label: "Thưởng thanh toán đúng hạn", jp: "完納奨励金", roles: ["admin", "wholesaler", "intermediate", "participant"] },
  { href: "/publication", label: "Công bố kết quả", jp: "取引結果公表", roles: ["admin", "wholesaler", "intermediate", "participant", "retail"] },
];
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  const role = profile.participant?.role ?? "retail";
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-harbor-900 text-white lg:min-h-screen">
        <div className="px-5 py-5 border-b border-harbor-700">
          <div className="text-xs text-harbor-100">サクラ湾産地市場</div>
          <div className="font-semibold">Chợ thủy sản Vịnh Sakura</div>
        </div>
        <nav className="flex lg:block overflow-x-auto px-2 py-3">
          {NAV.filter((n) => n.roles.includes(role)).map((n) => (
            <Link key={n.href} href={n.href} className="block whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-harbor-800">
              {n.label}{n.jp && <span className="ml-2 text-xs text-harbor-100">{n.jp}</span>}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-harbor-700 text-sm">
          <div className="font-medium">{profile.display_name}</div>
          <div className="text-xs text-harbor-100 mb-2">{ROLE_LABEL[role]}</div>
          <form action="/auth/signout" method="post"><button className="text-xs text-harbor-100 hover:text-white underline">Đăng xuất</button></form>
        </div>
      </aside>
      <main className="p-5 lg:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
