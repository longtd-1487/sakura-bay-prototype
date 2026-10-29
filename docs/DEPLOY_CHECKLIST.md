# Checklist lấy URL Vercel + repo (15 phút)

## A. Supabase (5 phút)
1. https://supabase.com → New project, region **Tokyo (ap-northeast-1)**, lưu mật khẩu DB.
2. SQL Editor → dán & chạy `supabase/migrations/001_schema.sql`, sau đó `supabase/seed.sql`.
3. Project Settings → API: copy **Project URL**, **anon key**, **service_role key**.
4. Tại máy: `cp .env.example .env.local`, điền 3 giá trị, chạy `npm install && npm run seed:users` → thấy 5 dòng ✓.
5. Dán link project vào bảng đầu README (`https://supabase.com/dashboard/project/<ref>`).

## B. Repo GitHub (3 phút)
```bash
git init && git add . && git commit -m "LAB-2 prototype"
gh repo create sakura-bay-prototype --private --source=. --push   # hoặc tạo trên web rồi git push
```
Settings → Collaborators → **Add people** → nhập GitHub của giảng viên, quyền **Read**. Dán link repo vào README.

## C. Vercel (5 phút)
1. https://vercel.com/new → Import repo vừa tạo (framework tự nhận Next.js).
2. Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → Deploy.
3. Supabase → Authentication → URL Configuration → Site URL = URL Vercel; Redirect URLs thêm `https://<app>.vercel.app/**`.
4. Mở URL → phải thấy màn hình đăng nhập. Dán URL vào README, commit & push (Vercel tự deploy lại).

## D. Giữ demo sống tới LAB-6
- Supabase Free tự pause sau 7 ngày không truy cập → trước ngày review vào Dashboard bấm **Resume**; hoặc 1 tuần mở app một lần.
- Không đổi mật khẩu 5 tài khoản demo; không xóa seed. Muốn reset dữ liệu: chạy lại `seed.sql` (sau khi `truncate` các bảng).
