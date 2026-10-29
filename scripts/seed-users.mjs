// Tạo tài khoản demo trên Supabase Auth và gắn với participants.
// Chạy: node scripts/seed-users.mjs   (cần SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY trong .env.local)
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
for (const line of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split("\n") : []) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

export const DEMO_USERS = [
  { email: "admin@sakura-bay.demo",     password: "Demo1234!", name: "Ban quản lý chợ (市場管理者)",  participant: "ADM-01" },
  { email: "oroshi@sakura-bay.demo",    password: "Demo1234!", name: "Sakura Suisan (卸売業者)",       participant: "WHS-01" },
  { email: "nakaoroshi@sakura-bay.demo",password: "Demo1234!", name: "Minato Shokuhin (仲卸)",         participant: "NAK-01" },
  { email: "sanka@sakura-bay.demo",     password: "Demo1234!", name: "Nhà hàng Hamamichi (売買参加者)",participant: "SBK-01" },
  { email: "kaidashi@sakura-bay.demo",  password: "Demo1234!", name: "Quán sushi Tanaka (買出人)",     participant: "KAI-01" },
];

const { data: parts } = await sb.from("participants").select("id, code");
const byCode = Object.fromEntries((parts ?? []).map(p => [p.code, p.id]));
for (const u of DEMO_USERS) {
  let userId;
  const { data, error } = await sb.auth.admin.createUser({ email: u.email, password: u.password, email_confirm: true });
  if (error) {
    const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
    userId = list.users.find(x => x.email === u.email)?.id;
    if (!userId) { console.error(u.email, error.message); continue; }
  } else userId = data.user.id;
  const { error: pe } = await sb.from("profiles").upsert({ id: userId, email: u.email, display_name: u.name, participant_id: byCode[u.participant] });
  console.log(pe ? `✗ ${u.email}: ${pe.message}` : `✓ ${u.email} → ${u.participant}`);
}
