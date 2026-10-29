import { supabaseServer } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

/** Lấy người dùng đang đăng nhập kèm hồ sơ participant. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("id,email,display_name,participant_id,participant:participants(*)").eq("id", user.id).single();
  if (!data) return { id: user.id, email: user.email ?? "", display_name: user.email ?? "", participant_id: null, participant: null };
  const p = Array.isArray(data.participant) ? data.participant[0] : data.participant;
  return { ...(data as any), participant: p ?? null } as Profile;
}

/** Dùng trong API route: trả về profile hoặc Response 401/403. */
export async function requireRole(allowed: Role[]): Promise<{ profile: Profile } | { error: Response }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: Response.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  const role = profile.participant?.role;
  if (!role || !allowed.includes(role)) return { error: Response.json({ error: `Vai trò ${role ?? "?"} không được phép thao tác này` }, { status: 403 }) };
  return { profile };
}
