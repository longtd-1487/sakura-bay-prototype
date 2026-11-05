## (b) Phần spec cố ý KHÔNG thành issue (hoặc chỉ làm phần khung)

| Phần spec | Xử lý | Lý do |
|---|---|---|
| FT-27 công nợ 買出人 (Could) — tab 売掛残 ở SC-26 | Chỉ khung, ẩn trong T-08-02-b; không có RPC/view `[DB_GAP-D7]` | Could; chờ NEEDS_DOMAIN_CONFIRMATION D10 (có cần 売掛残 không). Ngoài phạm vi công ty bán buôn (PREMISE § 3) |
| D-08 màn hình sửa `qualification_requirements` | Không tạo issue; danh mục điều kiện quản lý bằng seed/migration (T-03-01-a) | Decision-log D-08: giai đoạn 1 là backlog |
| 返還インボイス riêng cho khoản khấu trừ thưởng | Không tạo task; I-00-01 hỏi khách | Q19 mặc định "không làm 返還インボイス" |
| `revoke_qualification` | Nằm trong T-03-01-c nhưng có điều kiện "nếu I-00-04 xác nhận" | Lab5-notes SC-07: chỉ làm khi khách xác nhận |
| Phiếu bán nhiều dòng (SC-25 D4) | T-08-01-c làm 1 dòng, mở rộng khi D4 chốt | Chờ quyết định `[DB_GAP-D3..D6]` |
| Realtime cho board SC-16 | Không làm; T-05-03-d dùng làm mới 30 giây | SC-16 NEEDS_DOMAIN_CONFIRMATION #3; Realtime chỉ dùng cho せり (architecture § 1) |
| Supabase Management API trong SC-37 (sao lưu) | T-13-02-b chỉ hiển thị chính sách | Chờ I-00-07; D-28 PITR là tùy chọn trả phí |
| Email `negotiation_confirmation_requested`, nút 辞退 ở SC-19 | Không tạo task | BR-18 không yêu cầu; hỏi trong I-00-03 |
| Four-eyes (người xét ≠ người duyệt) cho tư cách / 業務規程 | Không tạo task | Q26 mặc định không bắt buộc |
| Hoàn 保証金 một phần, 充当 | Không tạo task | Q37 mặc định không hỗ trợ giai đoạn 1 |
| SC-24 TV (Could) | Có 2 task (T-07-03-a/b) xếp phase 6, cắt được khỏi release đầu | Lab5-notes SC-24 "có thể cắt" |
| 出荷奨励金 (Should) | Có 3 task E11, mặc định tắt bằng `shipping_incentive_tiers = []`; T-11-02-b phụ thuộc I-00-06 | Kênh trả chưa chốt |
| Ngoài phạm vi theo PREMISE § 1: native app, offline-first, đấu giá điện tử, AI chấm độ tươi / OCR 符丁, LINE/SMS, API ngân hàng/kế toán, nhiều 卸売業者 (A-10) | Không tạo issue | Đã chốt hướng trong PREMISE; tạo task sẽ trái quyết định kiến trúc |
| Tài liệu docs-only trong lab5-notes (screen-flow § 3 SC-03/SC-07, ADR-008 bảng) | Gộp vào một task T-01-05-b | Mỗi việc < 2 giờ, gộp theo quy tắc kích thước |

## (c) Lỗ hổng / mâu thuẫn trong spec LAB-4 phát hiện khi break task

| # | Spec | Lỗ hổng / mâu thuẫn | Đề xuất xử lý |
|---|---|---|---|
| 1 | D-11 · database-diagram (bỏ `applied_invoice_id`) ↔ SC-27 Data Flow, SC-28 E11 mapping, SC-32 E16 + Data Flow, GAP-22 | D-11 đã thay `incentives.applied_invoice_id` bằng bảng `incentive_applications`, nhưng 3 detail design vẫn ghi set `applied_invoice_id` trong `close_period` | **Sửa thiết kế**: T-01-05-b sửa docs; T-10-01-a bỏ cột; T-10-04-a và T-10-05-b đọc từ `incentive_applications` |
| 2 | SC-32 E03 `fn_rule('incentive_tiers', period_end)` ↔ BR-21 / BR-27 / `invoices.rule_set_id` | Bậc thưởng lấy theo `period_end`, còn hóa đơn của kỳ dùng 業務規程 hiệu lực **tại ngày chốt**. Nếu có phiên bản mới hiệu lực giữa `period_end` và ngày chốt, thưởng và hóa đơn của cùng kỳ dùng hai phiên bản khác nhau | **Giả định** dùng `invoices.rule_set_id` (T-10-02-b) + hỏi khách ở **I-00-02** |
| 3 | BR-27 (theo bên mua × kỳ, gộp hóa đơn) ↔ SC-35 E07 (đếm theo **từng hóa đơn**) | Hai định nghĩa 完納 khác đơn vị → 完納率 trên báo cáo không khớp số người được thưởng ở SC-32 | **Sửa thiết kế**: một hàm `fn_is_kannou` dùng chung (T-10-02-a, T-10-05-c); đơn vị đếm hỏi ở **I-00-02** |
| 4 | D-09 (cho 消込 vào kỳ đã khóa) ↔ SC-32 (E04 ẩn khi kỳ `locked`) ↔ BR-29 (khóa cần thưởng đã quyết định) | Tiền về **trước hạn** (received_on ≤ due) nhưng 消込 sau khi đã tính thưởng hoặc sau khi khóa kỳ → theo BR-27 bên mua đạt 完納 nhưng không còn đường tính lại → mất thưởng | **Giả định**: `check_period_lock` cảnh báo tiền về ≤ hạn chưa 消込 (T-09-01-b); hỏi khách cách xử lý ở **I-00-02**; test biên trong T-10-02-a |
| 5 | SC-32 Implementation Mapping R4 ("dòng không đạt tính trực tiếp, không lưu") ↔ SC-32 Interaction Notes ("bằng chứng là ảnh chụp") ↔ US-14 tc3 | Chỉ dòng đạt có `evidence` snapshot; dòng không đạt tính lại mỗi lần mở → sau khi 消込 / void, câu trả lời "vì sao tôi không được thưởng" thay đổi theo thời gian, không có bằng chứng tại lúc tính | **Đề xuất sửa thiết kế** (để mở, không chặn): lưu snapshot cho mọi bên mua được đánh giá (thêm status `not_qualified` hoặc bảng `incentive_evaluations`). Hiện tại T-10-03-a theo thiết kế gốc + `incentives_calculated_at` |
| 6 | BR-24 / D-11 chuyển tiếp phần dư | Không quy định thưởng `approved` của bên mua **không có hóa đơn kỳ sau** (ngừng mua, mất tư cách): treo vô hạn, không có hạn hay cách chi trả khác | **Giả định**: giữ `approved`, trừ vào hóa đơn kế tiếp bất kỳ (T-10-04-a); hỏi ở **I-00-02** |
| 7 | database-diagram `incentive_applications` "Σ amount theo incentive ≤ incentives.amount" ghi ở cột ràng buộc | Ràng buộc liên dòng, không làm được bằng CHECK | **Sửa thiết kế**: trigger (T-10-01-a) |
| 8 | SC-27 Data Flow `tax = round(goods×8%)` ↔ SC-28 E10 `floor` ↔ Q18 mặc định 切り捨て | Ba chỗ ba cách làm tròn | **Giả định** `floor` trong T-09-02-b; **I-00-01** |
| 9 | D-12 / BR-24 (thuế tính trên tiền hàng trước khấu trừ) | Theo chế độ インボイス, khoản giảm trừ cho người mua thường phải điều chỉnh thuế hoặc lập 返還インボイス; thiết kế giữ nguyên thuế → có thể sai thuế | **Câu hỏi khách I-00-01** (kế toán thuế); để mở |
| 10 | void_and_reissue (SC-28 E21 "gắn lại thưởng") ↔ SC-29 `ERR_INCENTIVE_DEPENDS` | Chỉ hủy 消込 bị chặn khi thưởng đã duyệt; void + phát hành lại **hóa đơn kỳ N** (đổi tổng, đổi hạn) sau khi thưởng N đã duyệt thì bằng chứng đổi mà không bị chặn; "gắn lại thưởng" không nói cap lại khi tiền hàng hóa đơn mới nhỏ hơn khấu trừ cũ | **Giả định** trong T-10-04-b: chặn void hóa đơn kỳ N khi thưởng N approved (ERR_INCENTIVE_DEPENDS); khi void hóa đơn có khấu trừ → chuyển application, cap lại, phần dư về `approved` |
| 11 | SC-32 Entry Conditions "kỳ ở `closing`" ↔ SC-27 / ADR-012 | Không chỗ nào nói RPC nào chuyển `billing_periods.status` sang `closing` | **Giả định**: `close_period` set `closing` (T-09-02-b) |
| 12 | rpc-and-error-index (85 RPC) | Thiếu RPC đã dùng trong spec: `incentive_evidence` (SC-32), `publish` (SC-35, architecture X-9), hủy phiếu bán lẻ (D-20), job hết hạn tư cách (BR-07), hàm khấu trừ thưởng trong `close_period` | **Sửa thiết kế**: T-01-05-b; task tương ứng T-10-01-b, T-12-01-b, T-08-01-b, T-03-01-d, T-10-04-a |
| 13 | feature-list FT-04 / screen-list SC-06, SC-07 = **Should** ↔ BR-04, PERM-05 (Must) | Kiểm quyền mua (Must) cần tư cách hiệu lực; nếu tư cách là Should thì quyền mua 2 cấp không chạy được | **Sửa ưu tiên**: DB/RPC tư cách + SC-07 xếp Must (I-03-01); SC-06 giữ Should |
| 14 | SC-37 = Should ↔ FT-42 = Must; email 成立 (BR-18, FT-17 Must) cần hàng đợi `notifications` | Hạ tầng thông báo thực chất là Must | **Sửa ưu tiên**: hàng đợi + cron ở E01 (T-01-04-b, Must); UI SC-37 giữ Should |
| 15 | lab5-notes SC-06/SC-07 seed "kyoka 7, shonin 4, toroku 2" ↔ A-02 / BR-02 | BR-02 liệt kê 4 điều kiện 承認 và "thông tin cơ bản + 仲卸 bảo lãnh" cho 登録 → khớp; nhưng danh mục chính thức chưa có (Q27) | **Câu hỏi khách I-00-04**; seed theo A-02 |
| 16 | `trg_block_locked_period` (database-diagram chỉ liệt kê transactions / invoices / settlements; SC-33 nói "5 bảng") | Số bảng bị khóa không thống nhất; `incentives` phải **không** bị chặn (SC-32 Lock check) | **Sửa thiết kế**: T-09-01-a gắn transactions/invoices, T-11-01-a gắn settlements, T-10-01-a ghi rõ loại trừ incentives |
| 17 | SC-27 ghi chú: chặn 締め処理 khi còn 交渉中 / yêu cầu sửa; "ngày chốt = ngày chạy hay `period_end`" | Ảnh hưởng trực tiếp hạn thanh toán và phiên bản 業務規程 dùng cho hóa đơn + thưởng (#2) | **Giả định** chặn (ERR_PERIOD_HAS_PENDING) và ngày chốt = ngày chạy; **I-00-07** |
| 18 | Q25 `credit_limit = 0` | Prototype hiểu "không giới hạn" (`lib/rules.ts:26`), thiết kế hiểu "không cho nợ" → dữ liệu migrate từ LAB-2 có thể khóa toàn bộ bên mua | **Giả định** "không cho nợ" + script migrate đặt hạn mức mặc định = 保証金 × hệ số; **I-00-03** |
| 19 | closing_cycle = `semi_monthly` | Hạn thanh toán kỳ N (period_end + 15) trùng thời điểm chốt kỳ N+1 → thưởng N chỉ trừ được từ kỳ N+2; khóa kỳ N phải chờ quyết định thưởng | Không mâu thuẫn logic (FIFO chuyển tiếp xử lý được) — **để mở**, ghi chú cho test T-10-04-a |
| 20 | D-20 tách `retail_slips` + `retail_sales` ↔ lab5-notes SC-25 còn ghi migration `retail_sales` + "sinh số phiếu" trên một bảng | Ghi chú LAB-5 chưa cập nhật theo D-20 | **Sửa thiết kế** trong T-08-01-a (dùng D-20) |
