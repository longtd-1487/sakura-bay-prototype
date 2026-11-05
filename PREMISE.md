# PREMISE — Backlog LAB-5 khác bộ spec LAB-4 ở đâu

Bản gốc: bộ spec LAB-4 nộp ngày 03/11/2026 (`specs/`: 37 detail design, 12 ADR, database-diagram v1.1, decision-log D-01…D-30). Backlog LAB-5 break trực tiếp từ bản này. Các khác biệt bên dưới phát hiện **trong lúc break task** (chi tiết lỗ hổng ở [task-breakdown.md § 4](task-breakdown.md#4-chỗ-hở-hoặc-mâu-thuẫn-của-spec-lab-4-phát-hiện-khi-break)).

## 1. Spec thêm / bỏ / sửa so với LAB-4

| # | Spec (mã / file) | Thêm / Bỏ / Sửa | Trước → sau | Vì sao | Issue bị ảnh hưởng |
|---|---|---|---|---|---|
| P-1 | SC-27 Data Flow, SC-28 (E11 mapping), SC-32 (E16, Data Flow), GAP-22 | Sửa | `close_period` gán `incentives.applied_invoice_id` → ghi dòng `incentive_applications` | D-11 (decision-log LAB-4) đã bỏ cột `applied_invoice_id`, nhưng 3 detail design chưa được viết lại theo. Lỗ hổng phát hiện khi break E10 | #80, #165, #171, #174 |
| P-2 | feature-list FT-04, screen-list SC-07 | Sửa ưu tiên | Should → **Must** (phần DB/RPC tư cách và SC-07). SC-06 giữ Should | BR-04 / PERM-05 (Must) kiểm "tư cách còn hiệu lực" khi mua. Nếu tư cách là Should thì quyền mua 2 cấp không chạy được | #29, #88–#93 |
| P-3 | screen-list SC-37, FT-41 | Sửa ưu tiên | Hàng đợi `notifications` + cron: Should → **Must**. Giao diện SC-37 giữ Should | Email 成立 (BR-18, FT-17 Must) cần hàng đợi | #78 |
| P-4 | BR-27, SC-32 E03, SC-35 E07 | Sửa | Hai định nghĩa 完納 (theo bên mua × kỳ ở SC-32; theo từng hóa đơn ở SC-35) → **một hàm `fn_is_kannou` dùng chung**, đơn vị bên mua × kỳ | 完納率 trên báo cáo phải khớp số bên mua được thưởng | #167, #175, #176 |
| P-5 | database-diagram § 6.1 `incentive_applications` | Sửa | Ràng buộc "Σ amount ≤ incentives.amount" ghi như CHECK → **trigger** | Ràng buộc liên dòng không làm được bằng CHECK | #165 |
| P-6 | rpc-and-error-index | Thêm | Bổ sung RPC đã dùng nhưng thiếu trong danh mục: `incentive_evidence`, `publish`, `cancel_retail_slip`, job hết hạn tư cách, `fn_apply_incentives` | Danh mục sinh tự động từ detail design nên bỏ sót RPC chỉ nhắc trong văn bản | #80, #166, #187, #146, #91, #171 |
| P-7 | trg_block_locked_period (database-diagram, SC-33) | Sửa | "5 bảng" không nêu tên → khóa `transactions`, `invoices`, `settlements`; **không** khóa `incentives` | SC-32 cần ghi thưởng cho kỳ đang chờ khóa | #150, #165, #178 |
| P-8 | lab5-notes SC-25 | Sửa | Một bảng `retail_sales` → `retail_slips` (đầu phiếu) + `retail_sales` (dòng) theo D-20 | Ghi chú LAB-5 trong SC-25 viết trước D-20 | #145 |

## 2. Giả định bổ sung

Giả định chỉ lấp chỗ spec/RFP để ngỏ; mọi giả định có câu hỏi gửi khách tương ứng trong epic #1.

| # | Giả định | Chỗ spec / RFP để ngỏ | Ảnh hưởng tới issue / estimate |
|---|---|---|---|
| A-12 | Bậc 完納奨励金 lấy theo phiên bản 業務規程 ghi trên hóa đơn của kỳ (`invoices.rule_set_id`, tức ngày chốt), không theo `period_end` | SC-32 E03 dùng `period_end`, BR-21 dùng ngày chốt | #168 (3 SWP). Đổi sang `period_end` không đổi estimate. Hỏi ở #16 |
| A-13 | Thuế 8% làm tròn **xuống** (切り捨て) theo hóa đơn | SC-27 ghi `round`, SC-28 ghi `floor`, Q18 mặc định 切り捨て | #155. Hỏi kế toán thuế ở #15 |
| A-14 | `close_period` chuyển kỳ sang `closing`. Ngày chốt = ngày chạy chốt kỳ | Không RPC nào nói ai đổi trạng thái `closing`; ngày chốt chưa định nghĩa | #155, #151. Hỏi ở #21 |
| A-15 | Chặn 締め処理 khi kỳ còn giao dịch 交渉中 hoặc yêu cầu sửa đang chờ (`ERR_PERIOD_HAS_PENDING`) | SC-27 ghi "cần xác nhận" | #155 |
| A-16 | Thưởng đã duyệt mà bên mua không có hóa đơn kỳ sau: giữ `approved`, trừ vào hóa đơn kế tiếp bất kỳ | BR-24 / D-11 không nói | #171. Hỏi ở #16 |
| A-17 | Tiền về trước hạn nhưng 消込 sau khi đã tính thưởng: không tự tính lại. `check_period_lock` cảnh báo để kế toán xử lý | D-09 cho 消込 vào kỳ khóa, nhưng BR-27 / BR-29 không nói tính lại | #151, #167. Hỏi ở #16 |
| A-18 | `credit_limit = 0` nghĩa là **không cho nợ**. Script migrate dữ liệu LAB-2 đặt hạn mức mặc định = 保証金 × hệ số | LAB-2 hiểu 0 = không giới hạn (`lib/rules.ts:26`); spec chưa nói | #122, #105. Hỏi ở #17 |
| A-19 | Giao dịch 交渉中 còn lại cuối ngày tự hủy lúc đóng ngày (job 0:05 JST) | Q22 chưa trả lời | #117 |
| A-20 | Team giả định 6 người: PM, BE-1, BE-2, FE-1, FE-2, QA; mỗi người 60 giờ tập trung / sprint 2 tuần | Spec không nói về nguồn lực | Lịch 14 sprint ([estimate.md § 2](estimate.md#2-cách-quy-ra-giờ)) |

## 3. Hướng đã chốt

| Vấn đề | Các phương án ở LAB-4 | Phương án chốt | Vì sao |
|---|---|---|---|
| Cách chia task cho logic 完納奨励金 | LAB-4 gom vào SC-32 (1 màn hình, 4 RPC) | **Epic riêng #11 (E10)** với 13 task lá, tách bằng chứng / phán định / bậc thưởng / tính / duyệt / khấu trừ / đồng bộ khi void / giao diện / KPI / E2E 2 kỳ | Đề LAB-5 bắt buộc tách; logic nhiều biến (hạn, ngày tiền về, phiên bản quy tắc, chuyển kỳ) cần test riêng từng biến |
| Bằng chứng cho dòng **không đạt** 完納 | SC-32 R4: tính trực tiếp, không lưu; Interaction Notes: "bằng chứng là ảnh chụp" | Giữ thiết kế gốc (chỉ lưu dòng đạt) + `incentives_calculated_at`. **Để mở** đề xuất lưu snapshot cho mọi bên mua | Không chặn sprint gần; quyết khi khách trả lời #16 |
| Gắn lại thưởng khi void / phát hành lại hóa đơn | SC-28 E21 "gắn lại thưởng" ↔ SC-29 chặn hủy 消込 khi thưởng đã duyệt | Chặn void hóa đơn kỳ N khi thưởng N đã `approved` (`ERR_INCENTIVE_DEPENDS`). Void hóa đơn **có** khấu trừ thì chuyển dòng áp dụng, cap lại, phần dư về `approved` | Tránh bằng chứng thưởng đổi sau khi duyệt |
| Phiếu bán lẻ một dòng hay nhiều dòng | SC-25 D4 để mở | Giai đoạn 1 làm 1 dòng; mở rộng khi D4 chốt | Mô hình D-20 đã cho phép nhiều dòng, chỉ UI chờ |
| Mức độ dùng skill chấm SWP | — | `tkm:estimate-swp`, level `medium`, KPI push tắt | Không có KPI Insight trong môi trường; `high` cần model thứ hai, tốn gấp đôi |
