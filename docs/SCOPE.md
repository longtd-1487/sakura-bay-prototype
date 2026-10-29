# Phạm vi prototype LAB-2 so với LAB-1

Prototype dựng **9 màn hình nhóm / 17 route** phủ các luồng cốt lõi của đề: nhập hàng → thẩm định → thỏa thuận (luồng chính) → đấu giá (ghi kết quả) → hóa đơn → tiền về → thưởng → công bố; kèm phân quyền 5 vai trò / 2 cấp quyền mua.

## 1. Màn hình & tính năng đã dựng (chạy thật, đọc/ghi Supabase)

| Màn hình (LAB-1) | Route | Tính năng LAB-1 | User story | Ghi chú |
|---|---|---|---|---|
| Login | `/login` | FT-01 | – | Supabase Auth email/password; middleware chặn mọi URL khác |
| Dashboard theo vai trò | `/dashboard` | FT-04 | – | Số liệu lấy từ DB; cảnh báo riêng cho 買出人 |
| Thành viên & phân quyền | `/participants` | FT-02, FT-03, FT-05 | US-01 | 5 vai trò, cấp 1/2, hạn mức; đình chỉ / khôi phục (chỉ admin) |
| Nhập hàng (入荷) | `/arrivals`, `/arrivals/new` | FT-10, FT-11 | US-02 | Đăng ký nhiều lot / tàu, ký gửi hay mua đứt |
| Lot & thẩm định | `/lots`, `/lots/[id]` | FT-12, FT-13, FT-14 | US-03, US-04 | Chấm độ tươi S/A/B/C + ghi chú + 符丁 do người chọn; chia kênh thỏa thuận / đấu giá / giữ |
| Giao dịch thỏa thuận (相対取引) | `/negotiations`, `/negotiations/new` | FT-15 → FT-19 | US-05, 06, 07(一部), 11 | Kiểm tra quyền realtime (dry-run API): cấp 2 chặn, đình chỉ chặn, vượt hạn mức chặn; xác nhận trên app **hoặc** xác nhận miệng kèm tên |
| Phiên đấu giá (せり) | `/auctions`, `/auctions/[id]` | FT-20, FT-21, FT-22 | US-08 | Màn hình nhập kết quả trúng giá tối giản cho Tablet; "Không ai mua" → chuyển lot sang thỏa thuận |
| Hóa đơn & tiền về | `/invoices`, `/invoices/[id]` | FT-27, FT-28, FT-29 | US-10, US-11, US-12(一部) | Chốt kỳ gộp theo bên mua + phí hoa hồng; ghi nhận tiền về, trạng thái đủ/một phần; hạn quá → tô đỏ |
| Thưởng thanh toán đúng hạn (完納奨励金) | `/incentives` | FT-31, FT-32 | US-14, US-15 | Tính theo kỳ (đủ & trước hạn) → admin duyệt → kỳ sau tự trừ vào hóa đơn |
| Công bố kết quả (公表) | `/publication` | FT-33 | US-15 | Tổng hợp theo ngày / loại cá: SL, cao, thấp, bình quân |

Backend: 11 API route (`app/api/**`), 13 bảng + 2 view trong Supabase, RLS bật.

## 2. Để ngoài phạm vi so với LAB-1 (và vì sao)

| Mục LAB-1 | Lý do bỏ ở prototype | Nếu làm thật cần gì |
|---|---|---|
| Phân bổ lot kéo-thả (FT-14 UI) | Không đổi bản chất luồng; dùng nút chọn kênh | Thư viện drag-drop (dnd-kit) |
| Bán trong chợ 仲卸 → 買出人 (F06: FT-23 → FT-26) | Luồng phụ, không chạm bẫy đọc-hiểu của đề | Bảng `retail_sales` + màn hình phiếu bán, tồn hàng |
| Bảng quyết toán chủ tàu 仕切書 (FT-30), PDF hóa đơn/nhãn lô (FT-13 in, FT-28 PDF) | Tính toán & in ấn, không ảnh hưởng luồng dữ liệu | Template PDF (react-pdf / Puppeteer), mẫu chứng từ thật của chợ |
| Import CSV 水揚げ / sao kê ngân hàng (FT-11, FT-29) | Thay bằng nhập tay | Chuẩn file với 漁協 / ngân hàng, parser + màn hình preview lỗi |
| Bảng hiển thị công khai trên sàn realtime (FT-22 表示板) | Prototype hiển thị kết quả trong trang phiên | Supabase Realtime channel + màn hình full-screen |
| Sửa giao dịch sau chốt có phê duyệt (US-07) | Có hủy khi còn "chờ xác nhận"; sau chốt không sửa | Workflow phê duyệt + audit log (FT-37) |
| Audit log, email thông báo, tham số 業務規程 có version (F10) | Không thấy được trên màn hình demo | Bảng `audit_logs` (trigger Postgres), Resend, bảng `rule_versions` với ngày hiệu lực |
| Báo cáo tháng, xuất CSV, dashboard biểu đồ (FT-34 → FT-36) | Thời gian | Query tổng hợp + Recharts, xuất CSV |
| Lịch mở chợ, master data quản trị (FT-06 → FT-09) | Dữ liệu mẫu đổ sẵn bằng seed | CRUD đơn giản |

## 3. Phần mock / đơn giản hóa trong các màn hình đã dựng

| Phần | Prototype | Bản thật |
|---|---|---|
| Dữ liệu | `supabase/seed.sql`: 8 thành viên, 3 tàu, 5 loại cá, 8 lot, 3 giao dịch, 2 hóa đơn kỳ trước | Master từ khách; migrate thành viên ban đầu |
| Tham số quy tắc | 3 tham số 1 version trong `market_rules` (phí 5.5%, thưởng 1%, hạn 15 ngày) – giả định | Lấy từ 業務規程 chính thức; version theo ngày hiệu lực |
| Hạn mức / công nợ | Công nợ = hóa đơn chưa trả + giao dịch đã chốt chưa lên hóa đơn | Thêm tiền ký quỹ, hối phiếu, điều kiện theo vai trò |
| Thưởng 完納奨励金 | 100% hóa đơn của kỳ đã trả đủ ≤ hạn → tỷ lệ cố định; cộng dồn trừ vào hóa đơn kỳ sau | Bậc tỷ lệ, điều kiện loại trừ, cách chi trả theo quy tắc thật |
| Xác nhận bên mua | Bấm trên app hoặc bán buôn ghi tên xác nhận miệng | Chữ ký điện tử / OTP nếu khách yêu cầu |
| Tiền về | Nhập tay số tiền & ngày | Import sao kê, khớp tự động theo số hóa đơn |
| RLS | Mọi user đăng nhập đọc tất cả; ghi qua API với service role sau `requireRole` | Policy theo vai trò & `participant_id`; không dùng service role ở route thường |
| Tích hợp bên thứ ba | Không có (漁協, ngân hàng, kế toán, email) | API/EDI, Resend, kết nối phần mềm kế toán |
| Offline tại cảng | Không | Queue + retry phía client, cảnh báo mất mạng |

## 4. Đầu vào cho LAB-3/4

Danh sách route và bảng ở trên là nền để vẽ wireframe chi tiết (LAB-4) và tách task (LAB-5). Schema đã mô hình hóa **cấp quyền (tier)** và **giao dịch hai hình thức (trade_type)** đúng như LAB-1 yêu cầu, nên mở rộng không phải đổi cấu trúc.
