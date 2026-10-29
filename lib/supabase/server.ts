import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client chạy ở server với phiên của người dùng hiện tại (đọc dữ liệu theo RLS). */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {} },
    },
  });
}
