# Quick Report – Làm việc với AI (LAB-2)

## 1. Công cụ / skill đã dùng

| Công cụ | Dùng vào việc gì |
|---|---|
| **Claude Code** (extension VS Code, model Claude Opus) | Cài đặt và chạy project, sửa lỗi môi trường, nâng bản vá bảo mật, đưa code lên GitHub, dựng Supabase và Vercel, đăng nhập thử bằng trình duyệt tự động, rà lại tài liệu so với code |
| Supabase CLI (`npx supabase`) | Chạy Supabase local trong Docker; đẩy schema và `seed.sql` lên project cloud (`db push --include-seed`) |
| Vercel CLI (`npx vercel`) | Tạo project, điền biến môi trường, deploy production |
| GitHub CLI (`gh`) và git chạy qua Docker (`alpine/git`) | Tạo repo private và push. Máy chưa cài Xcode Command Line Tools nên chưa có git |
| Puppeteer + Chrome | Đăng nhập thật bằng `oroshi` và `kaidashi` trên local và production, chụp màn hình, kiểm tra menu theo vai trò |
| VS Code | Sinh code prototype ban đầu (Next.js + schema Supabase + seed) và tài liệu phạm vi `docs/SCOPE.md` |

## 2. Chỗ AI sinh sai, cách phát hiện và cách sửa

| # | AI sai ở đâu | Phát hiện bằng cách nào | Sửa thế nào |
|---|---|---|---|
| 1 | Chẩn đoán `npm install` hỏng là do "npm 11 báo nhầm xung đột peer", đề xuất `--legacy-peer-deps` | Lần chạy lại báo lỗi khác: `EACCES` trong `~/.npm` | Nguyên nhân thật là cache npm có hơn 3.000 file thuộc root. Dời cache hỏng sang chỗ khác, cài lại không cần cờ nào |
| 2 | Nâng `@supabase/supabase-js` lên bản mới mà không nâng `@supabase/ssr` theo | Chạy `tsc --noEmit` thấy 10 lỗi kiểu `any` ở `middleware.ts` và `lib/supabase/server.ts` | Nâng `@supabase/ssr` lên 0.12.7, typecheck sạch |
| 3 | Đoán project Supabase ở region Tokyo | Kết nối vào DB báo `tenant/user not found` | Dò lần lượt các region, project thật ở Singapore. Cập nhật lại README |
| 4 | Báo đã điền xong biến môi trường lên Vercel, nhưng thực ra `NEXT_PUBLIC_SUPABASE_ANON_KEY` chưa được thêm | Chạy `vercel env ls` chỉ thấy 4/6 biến | Vercel đòi xác nhận vì biến `NEXT_PUBLIC_` trông giống secret. Thêm lại với `--type config --yes` |
| 5 | Vercel CLI tự thêm `.env*` vào `.gitignore`, chặn luôn `.env.example` | Đọc diff `.gitignore` sau khi chạy `vercel link` | Thêm dòng `!.env.example` |
| 6 | `SCOPE.md` (AI viết) ghi "9 màn hình nhóm / 17 route" và "11 API route" | Đếm lại `page.tsx` và `route.ts` trong code | Sửa thành 10 nhóm / 15 màn hình và 9 API route (12 handler) + route đăng xuất |
| 7 | Hướng dẫn gõ `! lệnh` trong chat để tự chạy lệnh đăng nhập | Lệnh không chạy, vì extension VS Code gửi dòng `!` như tin nhắn thường | Chuyển sang đăng nhập Vercel qua trình duyệt, Supabase thì dùng access token |

**Bài học:** đừng tin câu "đã xong" của AI mà phải xem bằng chứng: exit code, `tsc`, `vercel env ls`, đăng nhập thật trên URL production. Mỗi lỗi ở trên đều chỉ lộ ra khi đối chiếu với kết quả thật, không phải khi đọc lời AI báo cáo.

**Bảo mật:** token Supabase, mật khẩu DB và `service_role` key đã bị dán vào khung chat với AI. Sau khi làm xong đã xóa access token Supabase. Mật khẩu DB và `service_role` key vẫn giữ nguyên, chấp nhận được vì đây là project dummy với dữ liệu mẫu.

## 3. Thời gian thật đã dùng (gộp theo tuần, làm tròn 0.5h)

| Tuần | Việc | Giờ |
|---|---|---|
| 26/10 – 01/11/2026 | Sinh code prototype và tài liệu phạm vi (VS Code) | 4 |
| 26/10 – 01/11/2026 | Chạy local, sửa môi trường, đưa lên GitHub, Supabase, Vercel, viết README và report (cùng Claude Code) | 1.5 |
| **Tổng** | | **5.5** |
