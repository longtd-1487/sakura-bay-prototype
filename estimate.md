# Estimate — SWP đã review và giờ ước lượng

**Báo cáo HTML của skill chấm SWP:** [`reports/swp-estimate-sakura-bay-lab5.html`](reports/swp-estimate-sakura-bay-lab5.html). Đây là file tĩnh, mở offline được. Bản xem trực tiếp: https://htmlpreview.github.io/?https://github.com/longtd-1487/sakura-bay-prototype/blob/main/reports/swp-estimate-sakura-bay-lab5.html

- **Skill:** `tkm:estimate-swp` v2.1.0-beta.1, level `medium`, nguồn GitHub Project #1.
- **Phạm vi chấm:** 140 sub-issue được chấm trực tiếp; 59 epic/issue lấy tổng của con.
- **Kết quả:** tổng **790 SWP** do AI chấm → **827 SWP** sau khi người review hiệu chỉnh (calibration `calibrated`, 4 quy tắc, 16 task được áp lan).
- **Ghi lên Project:** SWP đã review và giờ ước lượng được ghi vào field "SWP", "Giờ ước lượng" cho cả 199 issue.

## 1. Issue mẫu skill chọn để kiểm

Skill chọn 5 đại diện một cách tất định (thấp nhất / trung vị / cao nhất / xa trung vị nhất / độ tin cậy thấp nhất). Mỗi issue được duyệt 2 bước: mức khó → điểm cụ thể. Điểm chốt được quy về trục Scope × Complexity bằng hàm `axes_for_swp()` của skill.

| Issue | Skill chấm (Scope × Complexity → SWP) | Bạn chốt | Lý do |
|---|---|---|---|
| [#20](https://github.com/longtd-1487/sakura-bay-prototype/issues/20) Làm rõ: 仕切書 và 出荷奨励金 (lý do chọn: điểm thấp nhất) | S1 × C1 → **1** | S2 × C1 → **3** | PM phải soạn câu hỏi, họp khách và cập nhật spec cho 4 điểm tiền bạc, không chỉ gửi câu hỏi |
| [#180](https://github.com/longtd-1487/sakura-bay-prototype/issues/180) `issue_settlement` / `void_settlement` (trung vị) | S3 × C2 → **5** | S3 × C3 → **6** | Hủy / phát hành lại chứng từ bất biến kèm kiểm khóa kỳ có nhiều nhánh hơn AI đánh giá |
| [#74](https://github.com/longtd-1487/sakura-bay-prototype/issues/74) Bộ hồi quy bảo mật RLS tổng (cao nhất) | S8 × C2 → **12** | S13 × C0 → **13** | Ma trận RLS mọi bảng × 9 vai trò cần fixture đầy đủ, rộng hơn một task QA thông thường |
| [#67](https://github.com/longtd-1487/sakura-bay-prototype/issues/67) Supabase Tokyo + Vercel hnd1 + pipeline migration (xa trung vị) | S5 × C3 → **10** | Giữ nguyên **10** | Phạm vi và rủi ro triển khai được mô tả đúng |
| [#19](https://github.com/longtd-1487/sakura-bay-prototype/issues/19) Làm rõ: nhập hàng, せり, bán trong chợ (độ tin cậy thấp nhất) | S2 × C1 → **3** | S5 × C1 → **6** | 7 câu hỏi trải trên 5 màn hình sàn; trả lời khác mặc định sẽ kéo theo cập nhật nhiều spec |

**Áp lan (chỉ cho task cùng nhóm chính xác: ngành, loại việc, chữ ký scope và complexity):**
- **cal-001** (API · feature · multi-component · stateful): Complexity +1 bậc.
- **cal-002** (QA · test-design · cross-layer + qa-matrix · stateful): Scope +1, Complexity −2.
- **cal-003**, **cal-004** (câu hỏi làm rõ): Scope +2 / +1.

Tổng cộng 16 task khác đổi điểm. Mọi thay đổi có ghi vết trong báo cáo HTML.

## 2. Cách quy ra giờ

| Mục | Nội dung |
|---|---|
| Cách đã chọn | **Quy ước đổi SWP ra giờ:** `Giờ ước lượng = SWP đã review × 3`. Không ước giờ trực tiếp từng issue |
| Giờ này gồm gì | Công làm một sub-issue tới Definition of Done ([task-breakdown § 1.2](task-breakdown.md#12-định-nghĩa-xong-definition-of-done)): code, pgTAP / unit test, sửa theo review. **Không** gồm buffer dự án, fix bug sau test hệ thống, quản lý dự án |
| Vì sao chọn quy ước | (1) SWP đã được người review hiệu chỉnh nên là thước đo nhất quán nhất. Ước giờ trực tiếp sẽ lại phụ thuộc cảm tính từng người. (2) Đổi tỷ lệ một chỗ là cập nhật được toàn backlog khi có velocity thật sau 2–3 sprint |
| Căn cứ tỷ lệ 3 giờ | Kiểm trên 5 issue mẫu đã review: #67 (10 SWP) → 30 giờ ≈ 4 ngày cho 2 môi trường + CI migration; #180 (6 SWP) → 18 giờ ≈ 2,5 ngày cho 2 RPC + pgTAP; #20 (3 SWP) → 9 giờ cho soạn câu hỏi + họp + cập nhật spec. Cả ba khớp kinh nghiệm thực tế. Một dev làm 6 giờ tập trung / ngày ≈ 2 SWP / ngày |
| Áp dụng nhất quán | Script [`skills/github-project-backlog-sync/plan-sprints.mjs`](skills/github-project-backlog-sync/plan-sprints.mjs) tính giờ cho mọi sub-issue bằng cùng hằng số `HOURS_PER_SWP = 3`. Epic / issue = tổng giờ của con. Không làm tròn thêm, không sửa tay |
| Lập lịch | Cùng script xếp task vào sprint theo phase → phụ thuộc → năng lực nhóm vai trò (BE-1/BE-2, FE-1/FE-2, QA, PM; 60 giờ tập trung / người / sprint) → **14 sprint** (09/11/2026 – 21/05/2027) |

## 3. Tổng theo epic

| Epic | Số issue (issue / sub-issue) | Tổng SWP | Tổng giờ | Ghi chú |
|---|---|---:|---:|---|
| [#1](https://github.com/longtd-1487/sakura-bay-prototype/issues/1) E00 Làm rõ yêu cầu với khách | 7 câu hỏi | 27 | 81 | PM; Sprint 1–2. Hai câu về tiền (#15, #16) đang Blocked |
| [#2](https://github.com/longtd-1487/sakura-bay-prototype/issues/2) E01 Nền tảng & hạ tầng | 5 / 14 | 99 | 297 | Sprint 1–8; Sprint 1 làm 10/14 task |
| [#3](https://github.com/longtd-1487/sakura-bay-prototype/issues/3) E02 Xác thực & tài khoản | 2 / 7 | 36 | 108 | |
| [#4](https://github.com/longtd-1487/sakura-bay-prototype/issues/4) E03 Tư cách 許可/承認/登録 & 保証金 | 3 / 9 | 54 | 162 | Ràng buộc đặc thù; lên Must (PREMISE P-2) |
| [#5](https://github.com/longtd-1487/sakura-bay-prototype/issues/5) E04 Danh mục & 業務規程 có phiên bản | 5 / 12 | 79 | 237 | `fn_rule` chặn mọi task tính tiền → Sprint 2–5 |
| [#6](https://github.com/longtd-1487/sakura-bay-prototype/issues/6) E05 Nhập hàng, 目利き, phân bổ kênh | 4 / 12 | 89 | 267 | Màn tablet, HITL |
| [#7](https://github.com/longtd-1487/sakura-bay-prototype/issues/7) E06 Giao dịch 相対 & quyền mua 2 cấp | 5 / 14 | 87 | 261 | Nghiệp vụ lõi |
| [#8](https://github.com/longtd-1487/sakura-bay-prototype/issues/8) E07 Phiên せり | 3 / 10 | 58 | 174 | Gồm TV sàn (Could) |
| [#9](https://github.com/longtd-1487/sakura-bay-prototype/issues/9) E08 Bán trong chợ 仲卸 → 買出人 | 2 / 5 | 24 | 72 | |
| [#10](https://github.com/longtd-1487/sakura-bay-prototype/issues/10) E09 Hóa đơn, tiền về, khóa kỳ | 4 / 15 | 85 | 255 | `close_period` 10 SWP (#155) |
| [#11](https://github.com/longtd-1487/sakura-bay-prototype/issues/11) **E10 完納奨励金** | 5 / 13 | **66** | **198** | Epic riêng theo yêu cầu đề; Sprint 8–13 |
| [#12](https://github.com/longtd-1487/sakura-bay-prototype/issues/12) E11 仕切書 & 出荷奨励金 | 2 / 8 | 38 | 114 | 出荷奨励金 mặc định tắt |
| [#13](https://github.com/longtd-1487/sakura-bay-prototype/issues/13) E12 公表, báo cáo, dashboard | 3 / 10 | 56 | 168 | |
| [#14](https://github.com/longtd-1487/sakura-bay-prototype/issues/14) E13 Audit log, cài đặt | 2 / 4 | 29 | 87 | |
| **Tổng** | **45 / 140** (+ 14 epic = 199) | **827** | **2.481** | Theo vai trò: BE 1.410 giờ · FE 753 · QA 225 · PM 93 |

## 4. So với estimate LAB-1

LAB-1 ước theo man-day **Implement** cho BE + FE, cộng FixBug 30% và Unit test 40%, buffer 20%, 7 giờ/ngày. Để so cùng định nghĩa với giờ LAB-5 (implement + test trong task, không buffer, không fix-bug sau test hệ thống), cột LAB-1 = **(Implement BE + FE) × 1,4 × 7 giờ**. QA của LAB-1 là sheet riêng nên so ở dòng riêng.

| Phần (chức năng / epic) | LAB-1 (giờ) | LAB-5 (giờ) | Chênh | Vì sao |
|---|---:|---:|---:|---|
| F01 Xác thực & phân quyền ↔ E02 + E03 | 186 | 270 | +84 | Tách 3 loại tư cách 許可/承認/登録 (PREMISE LAB-4) và nâng phần tư cách lên Must ([PREMISE P-2](PREMISE.md#1-spec-thêm--bỏ--sửa-so-với-lab-4)); thêm 保証金 (SC-30) |
| F02 Dữ liệu chủ ↔ E04 | 176 | 237 | +61 | 業務規程 có phiên bản + so sánh + duyệt (ADR-004) lớn hơn "tham số theo ngày" của LAB-1 |
| F03 Nhập hàng & thẩm định ↔ E05 | 230 | 267 | +37 | Thêm cơ chế mạng yếu (ADR-010) và lịch sử thẩm định chỉ thêm |
| F04 Giao dịch 相対 ↔ E06 | 230 | 261 | +31 | Kiểm quyền mua ở DB (ADR-002) + ngoại lệ đình chỉ có duyệt |
| F05 Phiên せり ↔ E07 | 216 | 174 | −42 | LAB-4 chốt chỉ ghi kết quả; Realtime chỉ cho TV |
| F06 Bán trong chợ ↔ E08 | 132 | 72 | −60 | FT-27 công nợ 買出人 chỉ làm khung (Could) |
| F07 Thanh toán & công nợ ↔ E09 | 176 | 255 | +79 | Khóa kỳ, void / phát hành lại, import sao kê 全銀 (giả định A-13, A-14, A-15) |
| F08 Quyết toán & thưởng ↔ E10 + E11 | 191 | 312 | +121 | **完納奨励金 tách 13 task** với khấu trừ chuyển kỳ (P-1, P-4, A-12, A-16, A-17) |
| F09 Công bố & báo cáo ↔ E12 | 186 | 168 | −18 | Dashboard dùng lại RPC báo cáo |
| F10 Quản trị hệ thống ↔ E13 | 59 | 87 | +28 | Audit log trên mọi bảng (D-18) |
| Nền tảng / hạ tầng ↔ E01 | LAB-1 tính riêng sheet Infrastructure (≈ 1,25 MM) | 297 | — | LAB-5 gom hạ tầng, RLS nền, khung lỗi, hook, PDF, hàng đợi email vào backlog vì là phụ thuộc của mọi epic |
| QA (sheet riêng LAB-1) ↔ task `[TEST]` | 539 | 225 (QA) + test trong từng task | — | LAB-5 đưa pgTAP vào DoD từng task; QA chỉ còn E2E / hồi quy |
| Làm rõ yêu cầu ↔ E00 | Tính trong BrSE (15% dev) | 81 | — | |
| **Tổng dev (F01–F10)** | **1.782** | **2.103** | **+321 (+18%)** | Tăng chủ yếu ở F08 (完納奨励金), F01 (tư cách), F07 (khóa kỳ): đúng các ràng buộc đặc thù LAB-4 / LAB-5 làm rõ thêm |
