# Chợ thủy sản Vịnh Sakura – Prototype LAB-2

Hệ thống hỗ trợ vận hành chợ bán buôn thủy sản (サクラ湾産地市場 取引支援システム).
Stack: **Next.js 14 · Supabase · Vercel**.

| | |
|---|---|
| **App (Vercel)** | https://sakura-bay-prototype.vercel.app ← *thay bằng URL sau khi deploy* |
| **Repo** | https://github.com/<org>/sakura-bay-prototype ← *mời giảng viên quyền Read* |
| **Supabase project** | https://supabase.com/dashboard/project/<project-ref> ← *dán link project* |
| Phạm vi & phần mock | [`docs/SCOPE.md`](docs/SCOPE.md) |

## Tài khoản demo (dùng tới hết LAB-6 – không xóa, không đổi mật khẩu)

Mật khẩu chung: **`Demo1234!`**

| Email | Vai trò | Xem được gì |
|---|---|---|
| `admin@sakura-bay.demo` | Ban quản lý chợ (市場管理者) | Phân quyền, đình chỉ thành viên, duyệt thưởng |
| `oroshi@sakura-bay.demo` | Công ty bán buôn (卸売業者) | Nhập hàng, thẩm định, ghi thỏa thuận, nhập kết quả đấu giá, chốt kỳ, tiền về |
| `nakaoroshi@sakura-bay.demo` | Công ty trung gian (仲卸) – cấp 1 | Xác nhận giao dịch, hóa đơn & thưởng của mình |
| `sanka@sakura-bay.demo` | Người mua được cấp phép (売買参加者) – cấp 1 | Như trên |
| `kaidashi@sakura-bay.demo` | Người mua lẻ (買出人) – cấp 2 | Bị giới hạn: chỉ xem công bố, không có menu giao dịch |

Mở URL app là gặp màn hình đăng nhập; mọi đường dẫn khác bị `middleware.ts` chặn khi chưa đăng nhập.

## ⚠️ Nếu app báo lỗi kết nối DB / đăng nhập không được

Supabase gói Free **tự tạm dừng project sau 7 ngày không dùng**. Vào Supabase Dashboard → mở project → bấm **Resume / Restore project**, đợi 1–2 phút rồi tải lại app. Dữ liệu và tài khoản demo vẫn còn nguyên.

## Chạy local

```bash
npm install
cp .env.example .env.local   # điền NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev                  # http://localhost:3000
```

Lần đầu dựng DB (chỉ làm 1 lần cho project Supabase mới): chạy `supabase/migrations/001_schema.sql` rồi `supabase/seed.sql` trong SQL Editor, sau đó `npm run seed:users` để tạo 5 tài khoản demo.

## Kịch bản demo 10 phút

1. `oroshi` → Nhập hàng → Đăng ký lô nhập → Lot & thẩm định: chấm độ tươi, chọn ký hiệu, chia kênh.
2. Giao dịch thỏa thuận → Ghi nhận: chọn bên mua *Quán sushi Tanaka (買出人)* → bị chặn (cấp 2); *Marine Mart* → bị chặn (đình chỉ); *Minato Shokuhin* → đủ điều kiện.
3. `nakaoroshi` → Xác nhận trên app (hoặc `oroshi` ghi xác nhận miệng kèm tên).
4. `oroshi` → Phiên đấu giá hôm nay → Bắt đầu → nhập kết quả từng lot / "Không ai mua".
5. Hóa đơn & tiền về → Chốt kỳ → mở hóa đơn → ghi nhận tiền về.
6. Thưởng thanh toán đúng hạn → Tính thưởng kỳ trước → `admin` → Duyệt.
7. Công bố kết quả theo ngày.

## Cấu trúc

`app/(app)/*` màn hình · `app/api/*` route ghi dữ liệu (kiểm tra vai trò trước, dùng service role) · `lib/rules.ts` kiểm tra quyền mua theo quy tắc chợ · `supabase/` schema + seed · `scripts/seed-users.mjs` tài khoản demo.
