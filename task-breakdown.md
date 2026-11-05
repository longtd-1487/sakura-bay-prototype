# Task breakdown — Từ spec LAB-4 tới backlog GitHub Project

GitHub Project: https://github.com/users/longtd-1487/projects/1 · Nguồn dữ liệu backlog: [`backlog/backlog.json`](backlog/backlog.json) (sinh bằng [`skills/backlog-generator/`](skills/backlog-generator/)) · Bảng ánh xạ key → số issue: [`backlog/backlog-map.json`](backlog/backlog-map.json)

**Quy mô:** 14 epic · 45 issue · 140 sub-issue (gồm 7 câu hỏi làm rõ) = **199 issue**, tất cả nằm trên Project.

## 1. Nguyên tắc chia task

### 1.1. Độ hạt

| Cấp | Là gì | Dừng chia khi | Có SWP? |
|---|---|---|---|
| **Epic** | Một nhóm chức năng lớn (14 epic, trùng nhóm F01–F10 của LAB-1, cộng E00 làm rõ, E01 nền tảng, E10 tách riêng 完納奨励金) | — | Tổng của con |
| **Issue** | Một năng lực người dùng thấy được: thường là một màn hình, hoặc một thành phần dùng chung (ví dụ "Kiểm quyền mua 2 cấp ở DB") | Có thể demo cho khách như một đơn vị | Tổng của con |
| **Sub-issue** | Một việc **một người làm xong trong ≤ 3 ngày**, thuộc đúng một loại: `[DB]` migration/ràng buộc · `[RPC]` hàm PL/pgSQL + pgTAP · `[FE]` giao diện · `[TEST]` E2E/hồi quy · `[INFRA]` · `[DOC]` | Không còn tách được mà mỗi phần vẫn kiểm thử được riêng | **Có** (chấm bằng skill) |

**Quy tắc tách:**
- Một màn hình có cả DB + RPC + UI thì tách ít nhất 2 sub-issue (backend / frontend) vì do hai người làm và test ở hai tầng khác nhau.
- RPC có nhiều nhánh nghiệp vụ (ví dụ phán định 完納, kiểm quyền mua) tách khỏi RPC "ghi dữ liệu" để mỗi nhánh có bộ pgTAP riêng.
- Việc nhỏ hơn khoảng 2 giờ thì **gộp** vào task gần nhất (ví dụ 6 sửa đổi tài liệu nhỏ gộp thành #80).
- Câu hỏi làm rõ với khách (E00) là sub-issue độc lập, do PM phụ trách, và được tham chiếu từ task bị chặn.

### 1.2. Định nghĩa xong (Definition of Done)

Một sub-issue chuyển **Done** khi:
1. Đạt mọi tiêu chí trong mục "Tiêu chí hoàn thành" của issue (đã viết sẵn dạng checklist, có test case cụ thể).
2. Migration chạy được trên Supabase local và staging; pgTAP / Vitest / E2E liên quan xanh trên CI.
3. Thông điệp lỗi tiếng Nhật đúng danh mục `ERR_*`; quyền và RLS đúng permissions-matrix của bộ spec LAB-4 (trường hợp có).
4. Được review (PR approve) và nếu chạm spec thì cập nhật spec cùng PR.
5. Giờ thực tế được ghi vào field "Giờ thực tế" trên Project.

Issue và epic Done khi mọi sub-issue con Done.

### 1.3. Dùng epic → issue → sub-issue trên Project

- Quan hệ cha – con dùng **sub-issue gốc của GitHub** (không dùng checklist trong body), nên Project tự hiện tiến độ con.
- Field "Cấp" (Epic / Issue / Sub-issue) để lọc view. **Chỉ sub-issue** được chấm SWP; epic và issue có SWP, giờ = tổng của con.
- Field khác: Status (Backlog → Todo → In Progress → In Review → Done, thêm Blocked), Iteration (Sprint 1–14, mỗi sprint 2 tuần), Phụ trách (team giả định), Ưu tiên (Must / Should / Could), Ràng buộc đặc thù, SWP, Giờ ước lượng, Giờ thực tế.
- Label: `type:*` (loại task), `area:E00…E13`, `gap` (sửa chênh lệch prototype), `constraint` (chịu ràng buộc đặc thù).
- Mỗi issue có dòng cuối `Backlog key: …` để script đồng bộ không tạo trùng khi chạy lại.

## 2. Spec → issue

Cột "Epic" ghi số issue của epic trên Project kèm mã epic. Cột cuối nêu phần spec **chưa** thành issue (hoặc chỉ làm khung) và lý do.

| Spec | Epic | Issue / sub-issue | Phần spec chưa thành issue và vì sao |
|---|---|---|---|
| SC-01 | #3 E02 | #27, #81, #82, #83 | — |
| SC-02 | #3 E02 | #27, #81, #82, #83 | — |
| SC-03 | #2 E01, #11 E10, #13 E12 | #26, #75, #79, #59, #175, #176, #64, #193, #194, #195 | — |
| SC-04 | #3 E02 | #28, #84, #86 | — |
| SC-05 | #2 E01, #3 E02, #4 E03 | #70, #28, #85, #87, #93 | — |
| SC-06 | #4 E03 | #30, #88, #94 | — |
| SC-07 | #2 E01, #4 E03 | #26, #29, #88, #89, #90, #92, #93, #96 | Màn hình sửa danh mục điều kiện (D-08) để backlog; revoke chỉ làm nếu #18 xác nhận |
| SC-08 | #5 E04 | #33, #101, #102 | — |
| SC-09 | #5 E04 | #34, #103, #104 | — |
| SC-10 | #2 E01, #5 E04, #7 E06, #10 E09 | #70, #35, #105, #106, #122, #127, #158 | — |
| SC-11 | #5 E04 | #32, #97, #98, #99, #100 | — |
| SC-12 | #5 E04 | #36, #107, #108 | — |
| SC-13 | #1 E00, #6 E05 | #19, #40, #120 | — |
| SC-14 | #1 E00, #2 E01, #6 E05 | #19, #76, #37, #109, #110, #111, #119, #120 | — |
| SC-15 | #1 E00, #2 E01, #6 E05 | #19, #76, #38, #112, #113, #114 | — |
| SC-16 | #6 E05 | #39, #115, #116, #117, #118, #119 | Realtime cho board không làm (làm mới 30 giây) |
| SC-17 | #2 E01, #7 E06 | #71, #44, #121, #131 | — |
| SC-18 | #1 E00, #2 E01, #6 E05, #7 E06 | #17, #76, #115, #117, #42, #43, #121, #122, #124, #125, #126, #127, #128, #129, #130 | — |
| SC-19 | #1 E00, #7 E06 | #17, #19, #44, #121, #125, #127, #132 | Nút 辞退 và email nhắc khi 交渉中 không làm (BR-18 không yêu cầu; hỏi ở #17) |
| SC-20 | #1 E00, #7 E06 | #19, #45, #133, #134 | — |
| SC-21 | #1 E00, #8 E07 | #19, #46, #135, #136, #137 | — |
| SC-22 | #8 E07 | #47, #139, #140, #142 | — |
| SC-23 | #2 E01, #8 E07 | #76, #47, #138, #139, #141, #142 | — |
| SC-24 | #1 E00, #8 E07 | #19, #48, #143, #144 | Could: 2 task xếp sprint cuối, cắt được khỏi release đầu |
| SC-25 | #1 E00, #9 E08 | #19, #49, #145, #146, #147 | Phiếu nhiều dòng chờ quyết định D4; làm 1 dòng trước |
| SC-26 | #1 E00, #7 E06, #9 E08 | #19, #128, #50, #148, #149 | Tab 売掛残 (FT-27, Could) chỉ làm khung, chờ khách (D10) |
| SC-27 | #1 E00, #2 E01, #10 E09, #11 E10 | #15, #21, #80, #52, #154, #155, #156, #157, #158, #58, #171 | — |
| SC-28 | #1 E00, #2 E01, #10 E09, #11 E10 | #15, #80, #53, #156, #159, #160, #58, #59, #171, #172, #174, #177 | 返還インボイス không làm (Q19 mặc định); hỏi ở #15 |
| SC-29 | #1 E00, #10 E09, #11 E10 | #21, #54, #161, #162, #163, #164, #167, #172 | — |
| SC-30 | #4 E03 | #31, #95, #96 | Hoàn 保証金 một phần, 充当 không làm (Q37) |
| SC-31 | #1 E00, #10 E09, #12 E11 | #20, #153, #60, #178, #179, #180, #181, #182 | — |
| SC-32 | #1 E00, #2 E01, #11 E10, #12 E11 | #16, #20, #80, #55, #57, #59, #165, #166, #167, #168, #169, #170, #173, #174, #176, #177, #61, #183, #184, #185 | 出荷奨励金 tách sang E11, mặc định tắt |
| SC-33 | #1 E00, #10 E09, #11 E10 | #21, #51, #150, #151, #152, #153, #169 | — |
| SC-34 | #1 E00, #13 E12 | #21, #62, #186, #188, #190 | — |
| SC-35 | #1 E00, #2 E01, #11 E10, #13 E12 | #16, #21, #80, #56, #59, #175, #176, #62, #63, #187, #189, #191, #192 | — |
| SC-36 | #1 E00, #2 E01, #14 E13 | #21, #72, #65, #196, #197 | — |
| SC-37 | #1 E00, #2 E01, #14 E13 | #21, #78, #66, #198, #199 | Không gọi Supabase Management API; chỉ hiện chính sách sao lưu (chờ #21) |
| ADR-001 | #2 E01 | #22, #67 | — |
| ADR-002 | #2 E01, #7 E06, #8 E07 | #23, #41, #122, #123, #138 | — |
| ADR-003 | #1 E00, #4 E03 | #18, #29, #88, #89, #91 | — |
| ADR-004 | #5 E04, #11 E10 | #32, #97, #98, #56, #168 | — |
| ADR-005 | #2 E01, #3 E02, #11 E10 | #23, #68, #71, #85, #166, #169 | — |
| ADR-006 | #6 E05, #7 E06 | #39, #115, #121 | — |
| ADR-007 | #6 E05 | #38, #112, #114 | — |
| ADR-008 | #2 E01, #7 E06, #14 E13 | #23, #72, #43, #128, #130, #65, #196 | — |
| ADR-009 | #8 E07 | #46, #135, #138, #140 | — |
| ADR-010 | #2 E01, #6 E05, #7 E06, #8 E07 | #24, #76, #37, #110, #111, #114, #42, #124, #47, #140 | — |
| ADR-011 | #2 E01, #6 E05, #10 E09, #12 E11, #13 E12 | #25, #77, #120, #53, #156, #181, #186 | — |
| ADR-012 | #10 E09 | #51, #150 | — |
| GAP-01 | #2 E01, #3 E02, #5 E04 | #23, #70, #28, #87, #35 | — |
| GAP-02 | #4 E03 | #29, #88 | — |
| GAP-03 | #5 E04 | #32, #97 | — |
| GAP-04 | #6 E05 | #39, #115 | — |
| GAP-05 | #6 E05, #10 E09 | #37, #109, #52, #154, #155 | — |
| GAP-06 | #6 E05 | #38, #112 | — |
| GAP-07 | #5 E04, #6 E05 | #36, #107, #38, #112 | — |
| GAP-08 | #7 E06 | #41, #122 | — |
| GAP-09 | #7 E06, #8 E07 | #41, #123, #47, #138 | — |
| GAP-10 | #7 E06 | #43, #121, #128 | — |
| GAP-11 | #1 E00, #10 E09, #12 E11 | #20, #52, #153, #155, #60, #179 | — |
| GAP-12 | #10 E09 | #51, #52, #150, #154 | — |
| GAP-13 | #10 E09, #11 E10 | #52, #154, #155, #58, #171 | — |
| GAP-14 | #10 E09 | #54, #161, #162 | — |
| GAP-15 | #2 E01, #3 E02 | #23, #24, #74, #75, #27, #81 | — |
| GAP-16 | #2 E01, #3 E02, #7 E06, #13 E12 | #23, #69, #71, #74, #28, #84, #44, #131, #64, #193 | — |
| GAP-17 | #2 E01, #6 E05 | #23, #70, #37, #109 | — |
| GAP-18 | #8 E07 | #46, #47, #135, #139 | — |
| GAP-19 | #5 E04, #12 E11 | #34, #103, #60, #178 | — |
| GAP-20 | #13 E12 | #62, #186, #190 | — |
| GAP-21 | #9 E08 | #49, #145 | — |
| GAP-22 | #2 E01, #11 E10 | #80, #55, #58, #165, #171 | — |

**Không tạo issue (ngoài phạm vi đã chốt ở LAB-4 PREMISE § 1):** native app, offline-first, đấu giá điện tử, AI chấm độ tươi / OCR 符丁, LINE / SMS, API ngân hàng / kế toán, nhiều 卸売業者. Four-eyes cho duyệt tư cách / 業務規程 (Q26 mặc định không).

## 3. Hạng mục chịu ràng buộc đặc thù của đề

### 3.1. 完納奨励金 — thưởng thanh toán đủ & đúng hạn (yêu cầu bắt buộc của Product A)

Không gộp vào một task "Tính thưởng". Logic này có nhiều biến:
- tổng hóa đơn theo kỳ;
- tổng đã 消込 và ngày tiền về thực tế;
- hạn thanh toán theo 業務規程 tại ngày chốt;
- bậc thưởng theo phiên bản 業務規程;
- duyệt của ban quản lý;
- khấu trừ có trần vào hóa đơn kỳ sau và chuyển phần dư;
- void / phát hành lại.

Vì vậy tách thành **epic riêng #11 (E10)** gồm 5 issue, 13 sub-issue, tổng **66 SWP / 198 giờ**:

| Ràng buộc | Issue | Vì sao tách riêng |
|---|---|---|
| Bằng chứng theo bên mua × kỳ (tổng hóa đơn, đã trả, ngày tiền về cuối, hạn) | #166 | Nguồn số liệu duy nhất cho tính, duyệt và giải thích "vì sao không được thưởng" |
| Phán định 完納 (đủ **và** đúng hạn) + trường hợp biên | #167 | 6 nhóm test biên riêng: trả thiếu ¥1, tiền về đúng ngày hạn, trễ 1 ngày, void / phát hành lại, 消込 sau khóa kỳ (D-09), nhiều hóa đơn một bên mua |
| Bậc thưởng theo phiên bản 業務規程 | #168 | Phụ thuộc ADR-004 (quy tắc có ngày hiệu lực); giả định A-12 có thể đổi khi khách trả lời |
| Dữ liệu thưởng + bảng `incentive_applications` | #165 | Mô hình mới của D-11 (chuyển tiếp phần dư) |
| `calculate_incentives`: chặn trước hạn, chạy lại được, chụp bằng chứng | #169 | Quy tắc thời điểm tính khác với quy tắc phán định |
| Duyệt / từ chối bởi 市場管理者 | #170 | Bước con người (HITL); quyền khác với kế toán |
| Khấu trừ vào hóa đơn kỳ sau: trần ≤ tiền hàng, FIFO, chuyển phần dư | #171 | Chạm vào `close_period` (E09), rủi ro sai tiền cao nhất |
| Đồng bộ thưởng khi void / phát hành lại hóa đơn và khi hủy 消込 | #172 | Trường hợp hiếm nhưng làm lệch tiền nếu bỏ sót (SWP cao nhất epic: 9) |
| Giao diện SC-32: bảng đối chiếu + panel bằng chứng | #173 | Màn kế toán |
| Giao diện SC-32: thanh duyệt ADM + chế độ bên mua + khấu trừ ở SC-28 | #174 | Màn ban quản lý và bên mua khác quyền |
| 完納率 KPI (dữ liệu) | #175 | Phải dùng chung `fn_is_kannou` (P-4) |
| Widget 完納率 ở SC-35 / SC-03 | #176 | Giao diện báo cáo |
| E2E hồi quy trọn 2 kỳ | #177 | Chỉ kiểm được khi đi qua 2 kỳ: tính → duyệt → khấu trừ → chuyển tiếp → void → khóa |

出荷奨励金 (thưởng chủ hàng, Should) tách sang epic #12 (E11): #183, #184 và giao diện #185. Mặc định tắt vì cách trả chưa chốt (#20).

### 3.2. Các ràng buộc đặc thù khác (gắn field "Ràng buộc đặc thù" + label `constraint`)

| Ràng buộc | Issue | Vì sao tách riêng |
|---|---|---|
| Quyền mua 2 cấp (買出人 không mua trực tiếp từ 卸売業者) | #41 → #122 (hàm kiểm quyền + hạn mức), #123 (trigger chặn cuối) | Cưỡng chế ở DB (ADR-002); 8 case pgTAP riêng; dùng chung cho 相対 (#124) và せり (#138) |
| Tư cách 許可 / 承認 / 登録 | #29 → #88–#93 | Ba quy trình xét khác nhau (7 / 4 / 2 điều kiện); quyền mua phụ thuộc tư cách còn hiệu lực |
| 業務規程 có phiên bản | #32 → #97, #98 | Mọi task tính tiền đọc `fn_rule`; làm sớm (Sprint 2–4) |
| HITL 目利き / 符丁 | #38 → #112–#114 | Lịch sử chỉ thêm, không gợi ý tự động (ADR-007) |
| 相対 xác nhận miệng / điện thoại | #42 → #125 | Nhánh xác nhận ngoài hệ thống, bắt buộc tên người xác nhận |
| 公表 theo 卸売市場法 | #62 → #186–#190 | Ảnh chụp số liệu bất biến, trang công khai không đăng nhập |
| Khóa kỳ 締め | #51 → #150–#153 | Trigger chặn ghi + ngoại lệ tiền về trễ (D-09) |

## 4. Chỗ hở hoặc mâu thuẫn của spec LAB-4 phát hiện khi break

| # | Spec | Chỗ hở / mâu thuẫn | Xử lý |
|---|---|---|---|
| 1 | D-11 ↔ SC-27, SC-28 E11, SC-32 E16, GAP-22 | D-11 đã bỏ `applied_invoice_id`, 3 detail design vẫn dùng | Đã sửa thiết kế: [PREMISE P-1](PREMISE.md#1-spec-thêm--bỏ--sửa-so-với-lab-4); làm ở #80 |
| 2 | SC-32 E03 ↔ BR-21 | Bậc thưởng theo `period_end`, hóa đơn theo ngày chốt | Giả định [PREMISE A-12](PREMISE.md#2-giả-định-bổ-sung); tạo issue làm rõ #16 |
| 3 | BR-27 ↔ SC-35 E07 | Hai đơn vị đếm 完納 | Đã sửa thiết kế: PREMISE P-4 |
| 4 | D-09 ↔ SC-32 E04 ↔ BR-29 | Tiền về đúng hạn nhưng 消込 sau khi tính thưởng → bên mua mất thưởng | Giả định PREMISE A-17; tạo issue làm rõ #16 |
| 5 | SC-32 R4 ↔ Interaction Notes ↔ US-14 tc3 | Dòng không đạt không lưu bằng chứng | Để mở: không chặn sprint gần, quyết khi có trả lời #16 (PREMISE § 3) |
| 6 | BR-24 / D-11 | Thưởng đã duyệt nhưng không có hóa đơn kỳ sau | Giả định PREMISE A-16; issue làm rõ #16 |
| 7 | database-diagram § 6.1 | Ràng buộc liên dòng ghi như CHECK | Đã sửa thiết kế: PREMISE P-5 |
| 8 | SC-27 ↔ SC-28 ↔ Q18 | Ba cách làm tròn thuế | Giả định PREMISE A-13; issue làm rõ #15 |
| 9 | D-12 / BR-24 | Khấu trừ thưởng có thể cần điều chỉnh thuế / 返還インボイス | Tạo issue làm rõ #15 (kế toán thuế) |
| 10 | SC-28 E21 ↔ SC-29 | Void hóa đơn sau khi thưởng đã duyệt | Đã chốt hướng: PREMISE § 3 dòng 3; làm ở #172 |
| 11 | SC-32 ↔ ADR-012 | Không RPC nào chuyển kỳ sang `closing` | Giả định PREMISE A-14 |
| 12 | rpc-and-error-index | Thiếu 5 RPC đã dùng | Đã sửa thiết kế: PREMISE P-6 |
| 13 | FT-04 / SC-07 (Should) ↔ BR-04 (Must) | Ưu tiên mâu thuẫn | Đã sửa thiết kế: PREMISE P-2 |
| 14 | SC-37 (Should) ↔ FT-17 (Must) | Hàng đợi email là Must | Đã sửa thiết kế: PREMISE P-3 |
| 15 | A-02 ↔ Q27 | Danh mục điều kiện tư cách chưa chính thức | Tạo issue làm rõ #18; seed theo A-02 |
| 16 | trg_block_locked_period | "5 bảng" không nêu tên | Đã sửa thiết kế: PREMISE P-7 |
| 17 | SC-27 | Chặn chốt kỳ khi còn 交渉中? Ngày chốt là gì? | Giả định PREMISE A-14, A-15; issue làm rõ #21 |
| 18 | Q25 | `credit_limit = 0` hiểu ngược với prototype | Giả định PREMISE A-18; issue làm rõ #17 |
| 19 | closing_cycle `semi_monthly` | Hạn kỳ N trùng chốt kỳ N+1 | Để mở: logic chuyển tiếp xử lý được, chỉ thêm case vào test #171 |
| 20 | lab5-notes SC-25 ↔ D-20 | Ghi chú LAB-5 viết trước D-20 | Đã sửa thiết kế: PREMISE P-8 |
| 21 | Phát hiện ở bước lập lịch | Hàm kiểm quyền mua #122 xếp Sprint 10, trong khi phần lớn E06 ở Sprint 6–11 | Để mở: phụ thuộc hiện chỉ ràng buộc phase. Rủi ro R-04 trong [progress-report](progress-report.md#4-rủi-ro-trễ) |
