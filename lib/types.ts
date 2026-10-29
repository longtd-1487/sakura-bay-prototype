export type Role = "admin" | "wholesaler" | "intermediate" | "participant" | "retail";
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Ban quản lý chợ (市場管理者)",
  wholesaler: "Công ty bán buôn (卸売業者)",
  intermediate: "Công ty trung gian (仲卸)",
  participant: "Người mua được cấp phép (売買参加者)",
  retail: "Người mua lẻ (買出人)",
};
export const ROLE_SHORT: Record<Role, string> = { admin: "Quản lý chợ", wholesaler: "Bán buôn", intermediate: "Trung gian", participant: "Mua cấp phép", retail: "Mua lẻ" };
export type Participant = { id: string; code: string; name: string; role: Role; tier: number; license_no: string | null; credit_limit: number; status: "active" | "suspended"; parent_intermediate_id: string | null };
export type Profile = { id: string; email: string; display_name: string; participant_id: string | null; participant: Participant | null };
export const CHANNEL_LABEL: Record<string, string> = { pending: "Chưa chia", negotiation: "Thỏa thuận (相対)", auction: "Đấu giá (せり)", held: "Giữ lại" };
