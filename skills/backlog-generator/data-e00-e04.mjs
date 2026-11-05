import { E, I, Q, L } from './lib.mjs';

// ───────────── E00 Làm rõ yêu cầu với khách ─────────────
E('E00', 'E00 Làm rõ yêu cầu với khách (Q18–Q41, PREMISE A-xx)', {
  scope: ['Gom 24 câu hỏi Q18–Q41 (decision-log § 3) và giả định A-01…A-11 thành 7 gói câu hỏi theo khu vực nghiệp vụ', 'Mỗi gói có mặc định đang thiết kế để dev không bị chặn; câu trả lời của khách phải được phản ánh lại vào spec trước khi task phụ thuộc vào "Done"'],
  s: 'decision-log § 3 (Q18–Q41), PREMISE § 4 (A-01…A-11), prototype-gap GAP-11',
  notes: ['Mọi tham số số nằm trong 業務規程 (ADR-004) → đổi giá trị không cần sửa code; chỉ câu hỏi về *logic* mới chặn', 'Gói I-00-01, I-00-02 chặn tính tiền (E09/E10) → hỏi trước tiên'],
});
Q('I-00-01', 'Thuế tiêu dùng, làm tròn & khấu trừ thưởng trên 適格請求書', {
  pr: 'Must', c: '完納奨励金',
  g: 'Chốt cách tính thuế và cách thể hiện khấu trừ 完納奨励金 trên 請求書 / 仕切書 trước khi viết close_period và draft_settlement.',
  s: 'Q18, Q19, Q10, A-04, D-12, BR-24, SC-27 Data Flow, SC-28 E10/E11',
  q: ['Q18: làm tròn thuế — 切り捨て theo hóa đơn (mặc định); SC-27 đang ghi `round`, SC-28 ghi `floor` → cần một quy tắc', 'Q19: thưởng trừ sau thuế, không lập 返還インボイス (mặc định) — kế toán thuế khách có chấp nhận theo chế độ インボイス không?', 'Thuế trên 仕切書: 8% hàng, 10% 手数料? (Q18)', 'Q10: mẫu chứng từ 請求書 / 仕切書 của khách và số đăng ký T của 卸売業者'],
  dod: ['Có văn bản trả lời của khách cho Q18, Q19, Q10', 'BR-24, SC-27, SC-28 cập nhật một công thức làm tròn duy nhất', 'Task phụ thuộc được cập nhật tiêu chí nếu khác mặc định'],
  blocks: ['T-09-02-b', 'T-09-02-c', 'T-10-04-a', 'T-11-01-b', 'T-11-01-d'],
});
Q('I-00-02', 'Quy tắc 完納奨励金: bậc thưởng, ngày áp quy tắc và các trường hợp biên', {
  pr: 'Must', c: '完納奨励金',
  g: 'Khóa định nghĩa 完納 và cách tính thưởng để E10 không phải làm lại.',
  s: 'Q20, Q21, A-06, BR-26, BR-27, BR-29, D-09, D-11, SC-32 Implementation Mapping, SC-35 E07',
  q: ['Q20: bậc thưởng — một tỷ lệ cho toàn bộ doanh số theo bậc đạt (mặc định) hay lũy tiến từng phần?', 'Bậc lấy theo 業務規程 hiệu lực **tại ngày chốt kỳ** (BR-21, mặc định) hay tại `period_end` (SC-32 E03 đang ghi)?', 'Q21: bên mua tự trừ 振込手数料 (先方負担) → hóa đơn thiếu vài trăm yên → mất 完納? Mặc định: mất, kế toán xử lý tay', 'Tiền về **trước hạn** nhưng 消込 sau khi kỳ đã khóa (D-09): có tính lại thưởng không? Mặc định: không, cảnh báo khi khóa kỳ', 'Bên mua có thưởng đã duyệt nhưng kỳ sau không có hóa đơn: treo vô thời hạn (mặc định) hay trả cách khác?', 'Bên mua đang 取引停止 / hết tư cách có được nhận thưởng không? Mặc định: có', '完納率 trên báo cáo đếm theo hóa đơn (SC-35) hay theo bên mua × kỳ (BR-27)?'],
  dod: ['Có trả lời cho 7 câu hỏi', 'BR-27 + SC-32 + SC-35 dùng chung một định nghĩa', 'pgTAP của T-10-02-a / T-10-02-b cập nhật theo trả lời'],
  blocks: ['T-10-02-a', 'T-10-02-b', 'T-10-03-a', 'T-10-04-a', 'T-10-05-c'],
});
Q('I-00-03', 'Vòng đời giao dịch 相対 và hạn mức tín dụng', {
  pr: 'Must', c: 'Quyền mua 2 cấp',
  g: 'Chốt các nhánh trạng thái giao dịch 相対 và ý nghĩa hạn mức trước khi viết RPC lõi SC-18.',
  s: 'Q22, Q23, Q24, Q25, BR-06, BR-15, BR-18, BR-20, SC-18 Điểm cần xác nhận, SC-19',
  q: ['Q22: 交渉中 còn lại cuối ngày → tự hủy 23:59 JST + thông báo (mặc định)', 'Q23: hủy cả giao dịch đã 成立 → yêu cầu sửa quantity = 0 + duyệt (mặc định)', 'Q24: sửa giao dịch đã vào hóa đơn → duyệt sửa rồi void + phát hành lại (mặc định)', 'Q25: `credit_limit = 0` = không cho nợ (mặc định; prototype hiểu là không giới hạn)', 'Draft có được lưu với bên mua 買出人 / hết hạn tư cách không? Mặc định: không', 'Bên mua có nút 辞退 trên SC-19 không? Có email nhắc khi chuyển 交渉中 không?', 'BR-15: khóa cả số lượng 交渉中 khi chuyển kênh (thiết kế) — khách đồng ý?'],
  dod: ['Có trả lời cho 7 điểm', 'SC-18/SC-19 cập nhật nhánh; pgTAP T-06-01-b, T-06-02-a phản ánh trả lời'],
  blocks: ['T-06-01-b', 'T-06-02-a', 'T-06-02-b', 'T-06-03-a', 'T-05-03-c'],
});
Q('I-00-04', 'Tư cách 許可/承認/登録 và 保証金', {
  pr: 'Must', c: '許可/承認/登録',
  g: 'Lấy danh mục điều kiện chính thức và các quy tắc chuyển trạng thái tư cách.',
  s: 'Q26, Q27, Q28, Q29, Q37, A-01, A-02, ADR-003, BR-01, BR-02, BR-08, BR-28, D-08',
  q: ['Q27: danh mục điều kiện chính thức 許可 (7) / 承認 (4) / 登録 (2) và loại file bằng chứng (mặc định A-02)', 'Q26: có cần four-eyes (người xét ≠ người duyệt) cho tư cách và 業務規程 không? Mặc định: không', 'Q28: 仲卸 bảo lãnh mất 許可 → 登録 của 買出人 tạm dừng (mặc định)?', 'Q29: 買出人 có bị 取引停止 không? Mặc định: không', 'Q37: hoàn 保証金 một phần / 充当 công nợ? Mặc định: không ở giai đoạn 1', 'A-01: không có ngoại lệ cho 買出人 mua trực tiếp — xác nhận', 'Có cần `revoke_qualification` (thu hồi) ở giai đoạn 1?'],
  dod: ['Seed danh mục điều kiện (T-03-01-a) dùng danh mục khách xác nhận', 'ADR-003 cập nhật nếu khác mặc định'],
  blocks: ['T-03-01-a', 'T-03-01-c', 'T-03-03-a'],
});
Q('I-00-05', 'Nhập hàng, せり và bán trong chợ', {
  pr: 'Should', c: 'HITL 目利き/符丁',
  g: 'Làm rõ các điểm nghiệp vụ sàn để form tablet không phải sửa sau khi chạy thử.',
  s: 'Q30, Q31, Q32, Q33, Q34, A-07, A-09, SC-13, SC-14, SC-15, SC-20, SC-21, SC-24, SC-25, SC-26',
  q: ['Q31: một tàu có cả 委託 và 買付 trong ngày → tách chuyến nhập (mặc định)', 'Q30: lô 持越 có phải thẩm định lại? Mặc định: không, có cảnh báo', 'Q32: thêm lô vào phiên せり đang chạy → cho thêm cuối hàng chờ (mặc định)', 'Q33: TV sàn ẩn giá loại cá nhạy cảm, hiện mã bên mua ngắn (mặc định)', 'Q34: phiếu bán lẻ có thuế 8%; hàng tồn hôm trước được bán tiếp (mặc định)', 'Bên mua có được xem ảnh thẩm định ở SC-19? Kích thước nhãn lô (A7) và nội dung QR?', 'Đặt trước khớp một phần (10 箱 nhưng bán 6) xử lý thế nào?'],
  dod: ['Có trả lời; SC-14/15/21/25 cập nhật nhánh nếu khác mặc định'],
  blocks: ['T-05-01-c', 'T-05-03-c', 'T-07-01-b', 'T-08-01-a', 'T-06-05-a'],
});
Q('I-00-06', 'Quyết toán chủ hàng 仕切書 và 出荷奨励金', {
  pr: 'Should', c: '業務規程 có phiên bản',
  g: 'Chốt chu kỳ 仕切 và cách tính/trả 出荷奨励金 (đang mặc định tắt).',
  s: 'Q38, A-03, A-07, BR-30, BR-31, BR-32, BR-33, D-10, FT-34, SC-31, SC-32',
  q: ['Q38: chu kỳ 仕切 theo kỳ (mặc định) hay theo chuyến nhập?', 'A-03: 委託手数料 5.5% thu của chủ hàng, không cộng vào hóa đơn bên mua (sửa GAP-11) — xác nhận', 'BR-33: base 出荷奨励金 gồm 委託 hay cả 買付?', 'Kênh trả 出荷奨励金: cộng vào 仕切書 kỳ sau (`incentive_applications.settlement_id`) hay trả riêng?'],
  dod: ['Có trả lời; nếu khách chưa cần 出荷奨励金 thì T-11-02-* giữ trạng thái Should, tắt bằng `shipping_incentive_tiers = []`'],
  blocks: ['T-11-01-b', 'T-11-02-a', 'T-11-02-b'],
});
Q('I-00-07', 'Vận hành, tích hợp và cấu hình hệ thống', {
  pr: 'Must',
  g: 'Thu thập mẫu file và chính sách vận hành cần cho tích hợp ngân hàng/kế toán và quản trị.',
  s: 'Q13, Q35, Q36, Q39, Q40, Q41, A-08, D-28, SC-27, SC-29, SC-33, SC-34, SC-35, SC-36, SC-37',
  q: ['Q13: ngân hàng khách dùng, xin file sao kê mẫu (全銀 + CSV)', 'Q40: định dạng CSV phần mềm kế toán (mặc định UTF-8 BOM)', 'Q36: chặn mở lại kỳ N khi N+1 đã khóa (mặc định)', 'SC-27: chặn 締め処理 khi còn 交渉中 / yêu cầu sửa chờ? Ngày chốt = ngày chạy hay `period_end`?', 'Q35: trang công khai hiện gì khi rút công bố (mặc định "データなし")', 'Q39: khóa sau N lần sai mật khẩu? hạn link mời 72 giờ', 'Q41: phạm vi audit log của W-MGR', 'A-08: khảo sát mạng tại cầu cảng; D-28: PITR có mua không'],
  dod: ['Có file mẫu ngân hàng + CSV kế toán trong repo test fixtures', 'Trả lời được ghi vào decision-log'],
  blocks: ['T-09-04-c', 'T-12-02-b', 'T-09-01-b', 'T-09-02-b', 'T-13-02-b'],
});

// ───────────── E01 Nền tảng & hạ tầng ─────────────
E('E01', 'E01 Nền tảng & hạ tầng', {
  scope: ['Supabase Tokyo + Vercel hnd1, pipeline migration, CI (typecheck/lint/Vitest/pgTAP)', 'Lõi DB nhóm A, RLS helpers, khung `fn_audit`, danh mục mã lỗi', 'Layout/menu theo `kind` + `functions`, hook ADR-010, module PDF (ADR-011), hàng đợi email + cron', 'Seed theo vai trò; đồng bộ tài liệu thiết kế'],
  s: 'ADR-001, ADR-005, ADR-008, ADR-010, ADR-011, architecture § 2, § 4, § 7, GAP-15, GAP-16, GAP-17, D-04, D-17, D-27, D-30',
  notes: ['Phase 1 — mọi epic khác phụ thuộc', 'Mọi ghi nghiệp vụ qua RPC `security definer` (ADR-005); không còn service role trong route nghiệp vụ (GAP-16)'],
});
I('I-01-01', 'E01', 'Môi trường, pipeline triển khai và CI', {
  g: 'Có môi trường local/staging/production ở Tokyo và CI chặn merge khi test đỏ.',
  s: 'ADR-001, architecture § 2, § 4, D-28',
  dod: ['PR mở → preview deploy + CI xanh mới merge được', 'Migration chạy tự động lên staging bằng `supabase db push`'],
});
L('T-01-01-a', 'I-01-01', 'infra', 'Supabase Tokyo (staging/prod) + Vercel hnd1 + pipeline migration', {
  role: 'BE-1', ph: 1,
  g: 'Dựng hạ tầng đích theo ADR-001 và pipeline đẩy migration.',
  s: 'ADR-001 Việc phải làm; architecture § 4; D-28',
  sc: ['Tạo Supabase project staging + production region ap-northeast-1; Vercel function region `hnd1`', 'Biến môi trường trên Vercel, không commit `.env*`', 'Job deploy migration staging khi merge main; production chạy tay có duyệt', 'Sao lưu hằng ngày giữ 7 ngày (gói Pro), ghi chú PITR tùy chọn'],
  dod: ['`supabase db push` chạy được từ CI lên staging', 'Độ trễ RPC đơn giản từ Vercel hnd1 → DB < 50ms (đo 1 lần, ghi vào README)', 'Không có secret trong repo (secret scan pass)'],
});
L('T-01-01-b', 'I-01-01', 'infra', 'CI GitHub Actions: typecheck, lint, Vitest, pgTAP', {
  role: 'QA', ph: 1, dep: ['T-01-01-a'],
  g: 'Mọi PR được kiểm tự động, gồm test DB pgTAP trên Supabase local.',
  s: 'architecture § 2 (CI/CD); ADR-005 Việc phải làm (test RPC song song migration)',
  sc: ['Workflow: `tsc --noEmit`, ESLint, Vitest, `supabase start` + `supabase test db` (pgTAP)', 'Cache node_modules + Docker image Supabase', 'Mẫu file pgTAP + helper đăng nhập theo vai trò (`tests.authenticate_as(role)`)'],
  dod: ['CI đỏ khi một test pgTAP mẫu fail', 'Thời gian CI < 10 phút', 'Branch protection bật "required checks"'],
});
L('T-01-01-c', 'I-01-01', 'infra', 'Nâng Next.js 14.2 → 15 / React 19 và gỡ service role khỏi route nghiệp vụ', {
  role: 'FE-1', ph: 1, dep: ['T-01-01-b'],
  g: 'Đưa codebase LAB-2 lên bản được hỗ trợ bảo mật và cắt mọi đường ghi bằng service role.',
  s: 'architecture § 2, § 7; GAP-16; D-04',
  sc: ['Nâng Next 15, React 19, @supabase/ssr; sửa API async `cookies()`/`params`', 'Xóa client service role khỏi `app/api/*` nghiệp vụ; chỉ giữ cho cron, migration và `lib/server/invite-user.ts` (D-04)', 'Lint rule cấm import `SUPABASE_SERVICE_ROLE_KEY` ngoài danh sách cho phép'],
  dod: ['`next build` pass', 'grep service role chỉ còn trong 3 vị trí cho phép', 'Smoke test đăng nhập + dashboard LAB-2 vẫn chạy'],
});
I('I-01-02', 'E01', 'Lõi dữ liệu nhóm A, RLS và audit', {
  g: 'Có schema người tham gia/tài khoản đúng TO-BE, RLS theo người xem và khung audit cho mọi bảng sau.',
  s: 'ADR-002, ADR-005, ADR-008, GAP-01, GAP-15, GAP-16, GAP-17, BR-03, BR-41, BR-43, D-18, D-30',
  dod: ['Không còn policy `using (true)`', 'Mọi bảng mới dùng helper RLS và `fn_audit`', 'Bộ test bảo mật tổng (T-01-02-e) xanh trước release'],
});
L('T-01-02-a', 'I-01-02', 'db', 'Migration nhóm A: participants (tier GENERATED), profiles.functions, business_date JST', {
  role: 'BE-1', ph: 1, c: 'Quyền mua 2 cấp', dep: ['T-01-01-a'],
  g: 'Sửa gốc lỗi "nhập tay tier" và ngày nghiệp vụ theo UTC.',
  s: 'SC-05 Ghi chú LAB-5; SC-10; GAP-01; GAP-17; BR-03; BR-41; database-diagram nhóm A',
  sc: ['`participants.kind` enum + `tier` GENERATED từ `kind`; `short_buyer_no` UK; `sponsor_intermediate_id`; CHECK số T+13', '`profiles.functions staff_function[]` + CHECK chỉ nhân viên 卸売業者 mới có functions; `is_active`', 'Hàm `fn_business_date()` = `(now() at time zone \'Asia/Tokyo\')::date` dùng làm default', 'Script migrate `role/tier/license_no` LAB-2'],
  dod: ['pgTAP: insert `functions` cho bên mua → lỗi', 'pgTAP: không update được `tier` trực tiếp', 'pgTAP: `fn_business_date()` lúc 2026-11-03 00:30 JST trả 11/03'],
});
L('T-01-02-b', 'I-01-02', 'db', 'RLS helpers auth_participant_id / is_wholesaler_staff / has_function + RLS nền', {
  role: 'BE-2', ph: 1, dep: ['T-01-02-a'],
  g: 'Thay RLS `using (true)` bằng chính sách theo người xem; thu hồi quyền ghi trực tiếp.',
  s: 'GAP-16; ADR-005; architecture § 7; PERM-09; SC-17 Ghi chú LAB-5',
  sc: ['Hàm `auth_participant_id()`, `is_wholesaler_staff()`, `has_function(text)`, `is_market_admin()` (stable, security definer, search_path cố định)', 'REVOKE INSERT/UPDATE/DELETE từ `authenticated` trên mọi bảng nghiệp vụ', 'Policy SELECT mẫu cho `participants`, `profiles`'],
  dod: ['pgTAP: mỗi helper đúng với 4 tài khoản seed (ADM, W-FLR, NAK-A, KAI)', 'pgTAP: `authenticated` insert trực tiếp vào `participants` → lỗi quyền'],
});
L('T-01-02-c', 'I-01-02', 'db', 'Khung fn_audit + audit_logs bất biến + quy ước app.audit_reason', {
  role: 'BE-1', ph: 1, dep: ['T-01-02-a'],
  g: 'Có trigger audit dùng chung để mọi migration sau chỉ cần gắn.',
  s: 'ADR-008; BR-43; D-18; SC-36 Ghi chú LAB-5',
  sc: ['Bảng `audit_logs` (actor, table, row_id, action, before, after, reason, at)', 'Trigger `fn_audit()` đọc `current_setting(\'app.audit_reason\', true)`', 'REVOKE UPDATE/DELETE mọi role + trigger chặn sửa → `ERR_AUDIT_IMMUTABLE`', 'Helper `fn_set_audit_reason(text)` cho RPC'],
  dod: ['pgTAP: update/delete `audit_logs` với mọi role đều lỗi', 'pgTAP: update một dòng bảng mẫu có reason → đúng 1 dòng audit có before/after/reason'],
});
L('T-01-02-d', 'I-01-02', 'db', 'Danh mục mã lỗi ERR_* (95 mã) + fn_raise + map thông điệp tiếng Nhật', {
  role: 'BE-2', ph: 1, dep: ['T-01-01-b'],
  g: 'Một nguồn mã lỗi duy nhất cho RPC và UI (D-30).',
  s: 'rpc-and-error-index § 2; D-30; screen-list "Lỗi từ server"',
  sc: ['Hàm `fn_raise(code text, detail jsonb)` trả SQLSTATE riêng + message JA', 'File TS `lib/errors.ts` sinh từ cùng bảng (script) + type union', 'Helper client đọc lỗi PostgREST → hiển thị nguyên văn tiếng Nhật'],
  dod: ['Script kiểm: 95 mã trong index = 95 mã trong catalog', 'Vitest: parse lỗi `ERR_CREDIT` từ response mẫu ra đúng message'],
});
L('T-01-02-e', 'I-01-02', 'test', 'Bộ hồi quy bảo mật tổng: ma trận RLS theo vai trò, anon, tự đăng ký', {
  role: 'QA', ph: 6, dep: ['T-02-01-a', 'T-06-01-a', 'T-09-02-a', 'T-10-01-a', 'T-12-01-a', 'T-08-01-a'],
  g: 'Chứng minh GAP-15/GAP-16 đã đóng trên toàn bộ bảng trước release.',
  s: 'GAP-15; GAP-16; PERM-09; BR-52; architecture § 7; prototype-gap § 3 (ưu tiên bảo mật)',
  sc: ['pgTAP ma trận: mỗi bảng nghiệp vụ × {ADM, W-FLR, W-ACC, W-MGR, NAK-A, NAK-B, SBK, KAI, anon}', 'E2E: gọi `/auth/v1/signup` bị từ chối; KAI đọc `invoices` người khác → 0 dòng', 'Kiểm không route nghiệp vụ nào dùng service role'],
  dod: ['Ma trận kỳ vọng nằm trong file fixture, test sinh từ fixture', 'Toàn bộ xanh trên staging', 'Báo cáo đính kèm vào release note'],
});
I('I-01-03', 'E01', 'Khung giao diện chung và hook mạng yếu', {
  g: 'Layout, menu, guard và các hook dùng chung để màn hình nghiệp vụ chỉ lo phần riêng.',
  s: 'screen-list "Quy ước chung", ADR-010, GAP-15, PERM-01…PERM-12',
  dod: ['Truy cập URL trái quyền → 404 cho mọi route', 'Hook ADR-010 có test mô phỏng mất mạng'],
});
L('T-01-03-a', 'I-01-03', 'fe', 'Layout (app) + menu theo kind/functions + GUARD-01/02 + UI kit dùng chung', {
  role: 'FE-1', ph: 1, dep: ['T-01-01-c', 'T-01-02-b'],
  g: 'Header/sidebar/tab-bar theo vai trò và bộ component dùng chung.',
  s: 'screen-list "Quy ước chung"; GAP-15 (`app/(app)/layout.tsx:20`); permissions-matrix § 3; SC-03 Ghi chú LAB-5',
  sc: ['Header: tên chợ, ngày nghiệp vụ JST, người dùng, vai trò; sidebar PC / tab-bar tablet', 'Menu sinh từ bảng cấu hình route × (kind, functions); route trái quyền → `notFound()`', 'Bỏ mặc định "không có hồ sơ = 買出人"', 'UI kit: StatusBadge, format ¥/ngày JST, DataTable lọc qua URL, ReasonDialog, ConfirmDialog, hiển thị lỗi RPC; nút ≥ 48px'],
  dod: ['Vitest: hàm tính menu cho 10 vai trò khớp permissions-matrix § 3', 'E2E: KAI mở `/admin/users` → 404', 'Không còn chuỗi tiếng Việt trên UI'],
});
L('T-01-03-b', 'I-01-03', 'fe', 'Hook useDraftForm + useIdempotentSubmit + NetworkBanner (ADR-010)', {
  role: 'FE-2', ph: 1, dep: ['T-01-01-c'],
  g: 'Giữ dữ liệu form và gửi lại an toàn khi mạng cầu cảng chập chờn.',
  s: 'ADR-010; SC-14 Ghi chú LAB-5; screen-list "Mạng yếu" (SC-14, SC-15, SC-18, SC-23)',
  sc: ['`useDraftForm(key)`: lưu localStorage/IndexedDB theo user + màn hình, xóa khi thành công', '`useIdempotentSubmit`: sinh `client_request_id` một lần cho mỗi lần gửi, retry backoff', '`NetworkBanner` online/offline + số bản nháp chờ gửi'],
  dod: ['Vitest: mất mạng giữa chừng → reload → dữ liệu còn', 'Vitest: gửi lại 2 lần cùng id → server mock nhận cùng id', 'Hook có tài liệu dùng trong README'],
});
I('I-01-04', 'E01', 'Chứng từ PDF, email và tác vụ định kỳ', {
  g: 'Module PDF tiếng Nhật và hàng đợi email/cron dùng chung cho mọi chứng từ và thông báo.',
  s: 'ADR-011, D-17, D-27, architecture § 1, § 2, FT-41, FT-38',
  dod: ['Một PDF mẫu tiếng Nhật render đúng font', 'Email gửi ngay sau commit, cron 0:05 gửi lại lỗi'],
});
L('T-01-04-a', 'I-01-04', 'infra', 'Module PDF dùng chung @react-pdf + Noto Sans JP + bucket documents', {
  role: 'FE-2', ph: 1, dep: ['T-01-01-c'],
  g: 'Một module render chứng từ bất biến cho 請求書, 仕切書, nhãn lô, phiếu bán, báo cáo.',
  s: 'ADR-011 Việc phải làm; architecture § 2, § 7',
  sc: ['`lib/pdf/` renderer + layout chung (header 卸売業者, số chứng từ, trang)', 'Nhúng Noto Sans JP (subset), kiểm ký tự 旧字体 thường gặp trong tên', 'Bucket private `documents`, path chứa `participant_id`, signed URL 300 giây'],
  dod: ['Snapshot test PDF mẫu (text extract khớp)', 'Policy Storage: bên mua A không lấy được file của B (pgTAP/storage test)'],
});
L('T-01-04-b', 'I-01-04', 'infra', 'Hàng đợi notifications + notification_templates + gửi Resend + Vercel Cron', {
  role: 'BE-2', ph: 1, dep: ['T-01-02-a'],
  g: 'Gửi email ngay sau commit, thử lại bằng cron; khung cron cho các job ngày.',
  s: 'D-17; D-27; architecture § 2 (Hàng đợi); SC-37 Ghi chú LAB-5; FT-41',
  sc: ['Bảng `notifications` (+`created_at`, `attempt_count`, status) và `notification_templates` seed 4 mẫu JP', 'Server Action đọc hàng đợi sau commit; render template escape biến', 'Route cron có secret; lịch 0:05 JST retry + chỗ đăng ký job (hết hạn tư cách, kích hoạt 業務規程, nhắc hạn, tạo kỳ)'],
  dod: ['Vitest: render escape `<script>`, biến lạ → `ERR_TEMPLATE_VARIABLE`', 'Email lỗi được gửi lại ở lần cron sau, `attempt_count` tăng', 'Cron từ chối khi thiếu secret'],
});
I('I-01-05', 'E01', 'Dữ liệu seed và đồng bộ tài liệu thiết kế', {
  g: 'Có dữ liệu thử đủ vai trò và tài liệu thiết kế không mâu thuẫn trước khi dev song song.',
  s: 'SC-03 Ghi chú LAB-5, SC-07 Ghi chú LAB-5, D-11, D-29, rpc-and-error-index',
  dod: ['`supabase db reset` tạo đủ tài khoản 10 vai trò', 'Các mâu thuẫn trong backlog-coverage § c được sửa hoặc ghi giả định'],
});
L('T-01-05-a', 'I-01-05', 'db', 'Seed dữ liệu theo vai trò (ADM, W-*, NAK-A/B, SBK, KAI) + fixture nghiệp vụ', {
  role: 'BE-2', ph: 1, dep: ['T-01-02-a'],
  g: 'Mọi dev/QA dùng chung bộ tài khoản và dữ liệu mẫu.',
  s: 'SC-03 Ghi chú LAB-5 (seed đủ vai trò); A-08; A-10',
  sc: ['Tài khoản: ADM, W-FLR, W-APR, W-AUC, W-ACC, W-MGR, NAK-A, NAK-B, SBK-01, SBK-02 (đình chỉ), KAI (bảo lãnh bởi NAK-A)', 'Seed được mở rộng theo epic (file seed tách theo nhóm bảng)', 'Mật khẩu seed chỉ ở local/staging'],
  dod: ['`supabase db reset` xanh', 'Seed không chạy trên production (guard env)'],
});
L('T-01-05-b', 'I-01-05', 'doc', 'Đồng bộ spec: applied_invoice_id → incentive_applications, RPC thiếu trong index, screen-flow § 3', {
  role: 'PM', ph: 1, c: '完納奨励金',
  g: 'Sửa các mâu thuẫn tài liệu phát hiện khi break task để dev không làm theo bản cũ.',
  s: 'D-11; GAP-22; SC-27 Data Flow; SC-28 E11; SC-32 E16; SC-35 E07; rpc-and-error-index; D-20; D-29',
  sc: ['SC-27/SC-28/SC-32: thay `incentives.applied_invoice_id` bằng `incentive_applications`', 'Index RPC: thêm `incentive_evidence`, `publish`, `cancel_retail_slip`, job hết hạn tư cách', 'Thống nhất định nghĩa 完納 (BR-27) cho SC-32 và SC-35; ngày áp bậc thưởng', 'screen-flow § 3: bổ sung các dòng SC-03/SC-07 đề xuất'],
  dod: ['PR tài liệu được tech lead duyệt', 'Không còn chuỗi `applied_invoice_id` trong docs (trừ lịch sử GAP-22)'],
});

// ───────────── E02 Xác thực & tài khoản ─────────────
E('E02', 'E02 Xác thực & tài khoản', {
  scope: ['SC-01 đăng nhập, SC-02 đặt lại mật khẩu / nhận lời mời, SC-04 danh sách tài khoản, SC-05 tạo/sửa tài khoản bằng lời mời'],
  s: 'SC-01, SC-02, SC-04, SC-05, FT-01, FT-02, FT-03, BR-09, GAP-15, D-04, D-05, Q39',
  notes: ['Không tự đăng ký — tài khoản chỉ tạo bằng lời mời sau khi tư cách được duyệt (BR-09)', 'Ngoại lệ service role duy nhất: `lib/server/invite-user.ts` (D-04)'],
});
I('I-02-01', 'E02', 'SC-01 / SC-02 Đăng nhập và đặt lại mật khẩu', {
  g: 'Người dùng đăng nhập bằng email/mật khẩu, đặt lại mật khẩu và nhận lời mời qua cùng một luồng.',
  s: 'SC-01, SC-02, FT-01, GAP-15, D-05, Q39',
  dod: ['Không ai tự tạo được tài khoản', 'Tài khoản bị khóa không đăng nhập được, bị đăng xuất giữa phiên'],
});
L('T-02-01-a', 'I-02-01', 'infra', 'Cấu hình Supabase Auth: tắt signup, mật khẩu ≥10, template JP, redirect', {
  role: 'BE-1', ph: 1, dep: ['T-01-01-a'],
  g: 'Đóng lỗ hổng tự đăng ký đã kiểm chứng trên bản deploy LAB-2.',
  s: 'SC-01 Ghi chú LAB-5 (CFG); SC-02 Ghi chú LAB-5 (CFG); GAP-15; BR-09; Q39',
  sc: ['`enable_signup = false` ở `config.toml` + staging + production', 'Độ dài mật khẩu 10; redirect URL `/auth/confirm`; hạn link mời 72h', 'Email template tiếng Nhật cho `recovery`, `invite`'],
  dod: ['Gọi `/auth/v1/signup` trên staging → bị từ chối (ghi lại lệnh curl)', 'Email mời/khôi phục hiển thị tiếng Nhật trên Inbucket'],
});
L('T-02-01-b', 'I-02-01', 'fe', 'Trang /login, /password-reset, /auth/confirm + safeNext + GUARD-03', {
  role: 'FE-1', ph: 2, dep: ['T-02-01-a', 'T-01-03-a'],
  g: 'Viết lại màn đăng nhập/đặt lại mật khẩu theo detail design, dùng chung bước đặt mật khẩu cho invite và recovery.',
  s: 'SC-01 § 3; SC-02 § 3; D-05; GUARD-03',
  sc: ['`app/login/page.tsx` nhãn JP, E04/E08/E09, bỏ khối demo', 'Middleware route công khai + `safeNext` dùng chung', '`/password-reset` bước 1 phản hồi không phân biệt email tồn tại; `/auth/confirm` + bước 2', 'GUARD-03: `is_active=false` giữa phiên → đăng xuất, `/login?notice=account_disabled`'],
  dod: ['Vitest `safeNext` 6 case: `/x`, `//evil`, `http://`, `/login`, rỗng, `\\\\evil`', 'Bước 2 chặn tài khoản `is_active=false`'],
});
L('T-02-01-c', 'I-02-01', 'test', 'E2E đăng nhập & đặt lại mật khẩu với Inbucket', {
  role: 'QA', ph: 2, dep: ['T-02-01-b'],
  g: 'Khóa hành vi đăng nhập/khôi phục bằng test tự động.',
  s: 'SC-01 Ghi chú LAB-5 (TEST); SC-02 Ghi chú LAB-5 (TEST)',
  sc: ['Sai mật khẩu; tài khoản bị khóa; `next` hợp lệ/không hợp lệ', 'Yêu cầu reset → mở link Inbucket → đặt mật khẩu → đăng nhập', 'Link hết hạn; email không tồn tại cho cùng phản hồi'],
  dod: ['7 kịch bản xanh trên CI (Supabase local)'],
});
I('I-02-02', 'E02', 'SC-04 / SC-05 Quản lý tài khoản và lời mời', {
  g: 'ADM xem, mời, sửa, khóa tài khoản; vai trò lấy từ người tham gia, chức năng nhân viên chọn được.',
  s: 'SC-04, SC-05, FT-02, FT-03, PERM-01, GAP-01, GAP-16, D-04',
  dod: ['Chỉ mời được người có tư cách hiệu lực (trừ nhân viên)', 'RLS `profiles` đúng PERM-01'],
});
L('T-02-02-a', 'I-02-02', 'db', 'RLS profiles theo PERM-01 + view v_user_accounts (trạng thái mời)', {
  role: 'BE-2', ph: 2, dep: ['T-01-02-b'],
  g: 'Chỉ ADM thấy mọi tài khoản; người khác chỉ thấy mình.',
  s: 'SC-04 Ghi chú LAB-5; PERM-01; GAP-16; decision-log § 2 (v_user_accounts)',
  sc: ['Policy SELECT `profiles`: ADM tất cả; W-MGR theo quyết định SC-04 § 7; còn lại `id = auth.uid()`', 'View `v_user_accounts` (security_invoker): kind, functions, is_active, invited_at/last_sign_in'],
  dod: ['pgTAP: ADM thấy tất cả, W-MGR đúng phạm vi, NAK chỉ thấy mình'],
});
L('T-02-02-b', 'I-02-02', 'rpc', 'prepare_user_invite / update_user_profile / set_user_active + module invite-user.ts', {
  role: 'BE-2', ph: 2, c: '許可/承認/登録', dep: ['T-02-02-a', 'T-03-01-a', 'T-01-02-c'],
  g: 'Mời tài khoản an toàn: RPC kiểm quyền + tư cách, module server dùng service role hẹp.',
  s: 'SC-05 Implementation Mapping; D-04; ADR-005 § 3; architecture § 7',
  sc: ['`prepare_user_invite` kiểm ADM + tư cách hiệu lực (bên mua) → trả token chuẩn bị', '`lib/server/invite-user.ts` gọi `inviteUserByEmail` chỉ khi token hợp lệ; trigger `fn_handle_invited_user`', '`update_user_profile`, `set_user_active` (chặn tự khóa, chặn khóa ADM cuối)'],
  dod: ['pgTAP 7 mã lỗi: ERR_FORBIDDEN, ERR_EMAIL_TAKEN, ERR_FUNCTIONS_REQUIRED, ERR_FUNCTIONS_NOT_ALLOWED, ERR_NO_VALID_QUALIFICATION, ERR_SELF_DEACTIVATE, ERR_LAST_ADMIN', 'Vitest: module invite từ chối khi không có token'],
});
L('T-02-02-c', 'I-02-02', 'fe', 'SC-04 danh sách tài khoản (lọc URL, badge trạng thái)', {
  role: 'FE-2', ph: 2, dep: ['T-02-02-a', 'T-01-03-a'],
  g: 'ADM tra cứu tài khoản theo vai trò/trạng thái.',
  s: 'SC-04 § 3–§ 7',
  sc: ['Bảng + bộ lọc qua URL (kind, function, trạng thái)', 'Badge dùng chung với SC-05/SC-10'],
  dod: ['E2E: NAK mở `/admin/users` → 404', 'Bộ lọc giữ được khi reload'],
});
L('T-02-02-d', 'I-02-02', 'fe', 'SC-05 form tạo/sửa tài khoản hai chế độ + hộp xác nhận khóa', {
  role: 'FE-2', ph: 2, dep: ['T-02-02-b', 'T-02-02-c'],
  g: 'ADM mời và sửa tài khoản; vai trò hiển thị từ người tham gia, không nhập tay tier.',
  s: 'SC-05 § 3–§ 6; GAP-01; FT-03',
  sc: ['Chế độ mời / sửa; E02 combobox người tham gia; E03–E05 chỉ đọc (kind, tier, tư cách)', 'Chọn functions cho nhân viên 卸売業者', 'Hộp xác nhận khóa tài khoản'],
  dod: ['Lỗi RPC hiển thị nguyên văn tiếng Nhật', 'Không có ô nhập tier'],
});

// ───────────── E03 Tư cách tham gia ─────────────
E('E03', 'E03 Tư cách tham gia 許可/承認/登録 & 保証金', {
  pr: 'Must', c: '許可/承認/登録',
  scope: ['Mô hình 3 loại tư cách với danh mục điều kiện riêng (ADR-003)', 'SC-06 danh sách hồ sơ, SC-07 xét duyệt rẽ nhánh theo loại, SC-30 保証金', 'Job hết hạn + nhắc gia hạn'],
  s: 'SC-06, SC-07, SC-30, ADR-003, BR-01, BR-02, BR-07, BR-08, BR-28, GAP-02, D-06, D-07, D-08, FT-04, FT-31',
  notes: ['FT-04/SC-06/SC-07 ghi Should nhưng BR-04 (Must) cần tư cách hiệu lực → phần DB/RPC tư cách xếp Must, giao diện SC-06 giữ Should', 'Danh mục điều kiện quản lý bằng seed/migration ở giai đoạn 1 (D-08)'],
});
I('I-03-01', 'E03', 'SC-07 Xét duyệt tư cách 許可/承認/登録 và mô hình dữ liệu', {
  c: '許可/承認/登録',
  g: 'Duyệt hồ sơ theo đúng danh mục điều kiện từng loại; cấp quyền mua suy ra từ tư cách hiệu lực.',
  s: 'SC-07, ADR-003, BR-01, BR-02, BR-07, BR-08, GAP-02, D-06, D-07',
  dod: ['許可 thiếu một điều kiện không duyệt được', '登録 cần 仲卸 bảo lãnh có 許可 hiệu lực', 'Tư cách hết hạn mất quyền mua lúc 00:00 JST'],
});
L('T-03-01-a', 'I-03-01', 'db', 'Migration qualifications / requirements / checks + seed 13 điều kiện + bucket bằng chứng', {
  role: 'BE-1', ph: 2, c: '許可/承認/登録', dep: ['T-01-02-a', 'T-04-01-a'],
  g: 'Có mô hình dữ liệu 3 loại tư cách (sửa GAP-02).',
  s: 'ADR-003 § 5; SC-06 Ghi chú LAB-5; SC-07 Ghi chú LAB-5; GAP-02; D-06; BR-08',
  sc: ['Enum `license_type`, `qualification_status`, `check_result`', '3 bảng + partial unique `(participant_id) WHERE status = \'approved\'` (D-06)', 'Seed điều kiện: kyoka 7, shonin 4, toroku 2', 'Bucket private bằng chứng + policy; RLS 3 bảng; gắn `fn_audit`'],
  dod: ['pgTAP: hai hồ sơ `approved` cùng người → lỗi unique', 'pgTAP: NAK không đọc được hồ sơ người khác'],
});
L('T-03-01-b', 'I-03-01', 'rpc', 'submit_qualification + record_check (upload bằng chứng)', {
  role: 'BE-2', ph: 2, c: '許可/承認/登録', dep: ['T-03-01-a'],
  g: 'Ghi hồ sơ và kết quả từng điều kiện.',
  s: 'SC-07 Implementation Mapping; ADR-003; BR-01; BR-02',
  sc: ['`submit_qualification` (ERR_APPLICATION_OPEN khi đã có hồ sơ mở)', '`record_check` lưu từng dòng + file bằng chứng (ERR_EVIDENCE_REQUIRED)', 'Giá trị khai báo (vốn, năm kinh nghiệm) so với `fn_rule`'],
  dod: ['pgTAP: ERR_FORBIDDEN cho NAK; ERR_EVIDENCE_REQUIRED khi thiếu file', 'Mỗi lần ghi sinh audit'],
});
L('T-03-01-c', 'I-03-01', 'rpc', 'approve / reject / revoke qualification rẽ nhánh theo loại', {
  role: 'BE-1', ph: 2, c: '許可/承認/登録', dep: ['T-03-01-b'],
  g: 'Duyệt hồ sơ đúng BR-01/BR-02 và cập nhật kind/sponsor của người tham gia (D-07).',
  s: 'SC-07 Ghi chú LAB-5 (TEST pgTAP); BR-01; BR-02; BR-08; D-06; D-07; X-1',
  sc: ['`approve_qualification`: kiểm đủ điều kiện bắt buộc theo `license_type`; `valid_to` theo `validity_years_*`; hồ sơ cũ → `superseded` cùng transaction; cập nhật `participants.kind`, sponsor', '`reject_qualification` (ERR_DECISION_NOTE_REQUIRED); `revoke_qualification` nếu I-00-04 xác nhận'],
  dod: ['pgTAP: kyoka thiếu 1 điều kiện → ERR_REQUIREMENT_UNMET', 'pgTAP: shonin đủ 4 → `valid_to` = +3 năm − 1 ngày', 'pgTAP: toroku với 仲卸 hết hạn → ERR_SPONSOR_INVALID', 'pgTAP: duyệt hồ sơ mới → cũ `superseded`; tier đổi theo kind'],
});
L('T-03-01-d', 'I-03-01', 'rpc', 'Job hết hạn tư cách 00:00 JST + email nhắc gia hạn', {
  role: 'BE-2', ph: 2, c: '許可/承認/登録', dep: ['T-03-01-c', 'T-01-04-b'],
  g: 'Tư cách hết hạn tự chuyển `expired` và người dùng được nhắc trước.',
  s: 'BR-07; D-24 (`qualification_reminder_days`); ADR-003 Việc phải làm (job hết hạn)',
  sc: ['Hàm `expire_qualifications(p_date)` gọi từ cron 00:00 JST', 'Enqueue email nhắc trước `qualification_reminder_days` ngày (một lần mỗi mốc)'],
  dod: ['pgTAP: `valid_to` = hôm qua → `expired`; fn_check_buyer_eligibility trả ERR_QUALIFICATION sau đó', 'Không gửi trùng email nhắc khi cron chạy lại'],
});
L('T-03-01-e', 'I-03-01', 'fe', 'SC-07 RequirementChecklist rẽ nhánh + upload thử lại + DecisionPanel', {
  role: 'FE-1', ph: 2, c: '許可/承認/登録', dep: ['T-03-01-c'],
  g: 'Màn xét duyệt hiển thị đúng danh mục điều kiện theo loại, lưu từng dòng.',
  s: 'SC-07 § 3–§ 7; X-1',
  sc: ['Checklist lấy từ DB theo `license_type` (không hard-code)', 'Upload bằng chứng có thử lại; lưu từng dòng', 'DecisionPanel E20/E21: nút duyệt khóa khi thiếu điều kiện; lý do từ chối'],
  dod: ['Nút 承認 disabled khi còn điều kiện bắt buộc chưa đạt', 'Lỗi RPC hiển thị nguyên văn'],
});
L('T-03-01-f', 'I-03-01', 'test', 'E2E luồng 8: SC-06 → SC-07 duyệt → SC-05 mời → SC-02 → SC-01 (3 loại tư cách)', {
  role: 'QA', ph: 2, c: '許可/承認/登録', dep: ['T-03-01-e', 'T-03-02-a', 'T-02-02-d', 'T-02-01-c'],
  g: 'Chứng minh luồng cấp tư cách → tài khoản chạy trọn vẹn cho 許可, 承認, 登録.',
  s: 'SC-07 Ghi chú LAB-5 (TEST e2e); SC-05 Ghi chú LAB-5 (TEST); BR-09',
  sc: ['3 kịch bản theo loại; 許可 thiếu điều kiện bị chặn', 'NAK hết hạn tư cách không được mời'],
  dod: ['3 kịch bản + 1 kịch bản chặn xanh trên CI'],
});
I('I-03-02', 'E03', 'SC-06 Danh sách hồ sơ tham gia', {
  pr: 'Should', c: '許可/承認/登録',
  g: 'ADM theo dõi tiến độ xét hồ sơ theo loại và trạng thái.',
  s: 'SC-06, FT-04, decision-log § 2 (v_qualification_progress)',
  dod: ['Thẻ đếm khớp dữ liệu', 'W-MGR không thấy E02, NAK → 404'],
});
L('T-03-02-a', 'I-03-02', 'fe', 'SC-06 danh sách + tab + thẻ đếm (kèm view v_qualification_progress)', {
  role: 'FE-2', ph: 2, pr: 'Should', c: '許可/承認/登録', dep: ['T-03-01-a', 'T-01-03-a'],
  g: 'Danh sách hồ sơ có tiến độ điều kiện.',
  s: 'SC-06 § 3–§ 7; SC-06 Ghi chú LAB-5',
  sc: ['View `v_qualification_progress` (mandatory_met, missing_count)', 'Tab theo loại, thẻ đếm, badge dùng chung'],
  dod: ['pgTAP: view tính đúng `mandatory_met` khi thiếu dòng check', 'E2E: W-MGR không thấy E02; NAK → 404'],
});
I('I-03-03', 'E03', 'SC-30 Quản lý 保証金', {
  pr: 'Should',
  g: 'Ghi nộp/hoàn 保証金; giá trị dùng cho điều kiện tư cách và hạn mức mặc định.',
  s: 'SC-30, FT-31, BR-02, BR-06, BR-28, Q37',
  dod: ['Hoàn chỉ khi tư cách chấm dứt và công nợ = 0'],
});
L('T-03-03-a', 'I-03-03', 'rpc', 'Bảng deposits + RPC record_deposit / return_deposit / check_deposit_return', {
  role: 'BE-2', ph: 3, pr: 'Should', dep: ['T-03-01-a', 'T-06-01-b'],
  g: 'Quản lý 保証金 có kiểm điều kiện hoàn.',
  s: 'SC-30 Ghi chú LAB-5; BR-28; Q37',
  sc: ['Bảng `deposits` + RLS (bên mua xem của mình) + `fn_audit`', '`check_deposit_return` dùng `fn_buyer_exposure`; `return_deposit` chặn khi còn nợ/tư cách hiệu lực'],
  dod: ['pgTAP: còn nợ → ERR_DEPOSIT_RETURN_BLOCKED; tư cách còn hiệu lực → chặn; hoàn 2 lần → ERR_ALREADY_RETURNED'],
});
L('T-03-03-b', 'I-03-03', 'fe', 'SC-30 danh sách + panel + 2 modal; hiện số giữ ở điều kiện DEPOSIT của SC-07', {
  role: 'FE-2', ph: 3, pr: 'Should', dep: ['T-03-03-a', 'T-03-01-e'],
  g: 'Kế toán/ADM ghi nộp, hoàn 保証金.',
  s: 'SC-30 § 3–§ 7; SC-07 điều kiện DEPOSIT',
  sc: ['Danh sách + panel chi tiết; modal nộp / hoàn', 'SC-07: dòng DEPOSIT hiển thị tổng đang giữ (chỉ đọc)'],
  dod: ['W-ACC/W-MGR chỉ xem (R) theo matrix; ADM ghi được'],
});

// ───────────── E04 Danh mục & 業務規程 ─────────────
E('E04', 'E04 Danh mục & 業務規程 có phiên bản', {
  c: '業務規程 có phiên bản',
  scope: ['SC-11 業務規程 có phiên bản + lịch chợ', 'SC-08 品目・規格, SC-09 船・荷主, SC-10 参加者 (đình chỉ, hạn mức), SC-12 符丁'],
  s: 'SC-08, SC-09, SC-10, SC-11, SC-12, ADR-004, BR-40, BR-42, GAP-03, GAP-19, D-23, D-24, D-26',
  notes: ['Mọi chứng từ lưu `rule_set_id`; không sửa phiên bản đã hiệu lực (ADR-004)', '`fn_rule` chặn mọi RPC tính tiền → T-04-01-a ở phase 1'],
});
I('I-04-01', 'E04', 'SC-11 Tham số 業務規程 theo phiên bản và lịch chợ', {
  c: '業務規程 có phiên bản',
  g: 'Quản lý phiên bản 業務規程 có ngày hiệu lực và duyệt; quản lý 休市日.',
  s: 'SC-11, ADR-004, BR-40, BR-42, GAP-03, D-24, FT-08',
  dod: ['Hóa đơn chốt hôm nay vẫn lưu phiên bản đang hiệu lực dù phiên bản mới đã duyệt cho ngày mai', 'Không sửa được phiên bản `active`'],
});
L('T-04-01-a', 'I-04-01', 'db', 'rule_sets / rule_values / market_calendar + fn_rule + migrate market_rules → v1', {
  role: 'BE-1', ph: 1, c: '業務規程 có phiên bản', dep: ['T-01-02-a'],
  g: 'Nền tham số có phiên bản cho mọi RPC tính tiền (sửa GAP-03).',
  s: 'ADR-004 Việc phải làm; SC-11 Ghi chú LAB-5; GAP-03; BR-40; D-23; D-24; business-rules § 1',
  sc: ['`rule_sets` (+created_by, based_on, approved_at), `rule_values`, `market_calendar`', '`fn_rule(key, date)` trả giá trị phiên bản hiệu lực tại ngày; `fn_rule_set_id(date)`', 'Catalog kiểu 19 key (SQL CASE + zod sinh từ cùng nguồn)', '`fn_assert_market_open(date)` dùng chung cho trigger BR-40', 'Migrate `market_rules` → `v1` đủ 19 key'],
  dod: ['pgTAP: `fn_rule` đúng ở ranh giới `effective_from`', 'pgTAP: thiếu key → ERR_RULE_KEY_MISSING', 'pgTAP: `fn_assert_market_open` với 休市日 → ERR_MARKET_CLOSED'],
});
L('T-04-01-b', 'I-04-01', 'rpc', 'phiên bản 業務規程 (draft/approve/revoke) + save_market_calendar + cron activate_rule_sets', {
  role: 'BE-1', ph: 2, c: '業務規程 có phiên bản', dep: ['T-04-01-a', 'T-01-04-b'],
  g: 'Vòng đời phiên bản: nháp → duyệt → hiệu lực, không sửa bản đã hiệu lực.',
  s: 'SC-11 Implementation Mapping; BR-42; ADR-004',
  sc: ['`create_rule_set_draft`, `save_rule_set_draft`, `delete_rule_set_draft`, `approve_rule_set`, `revoke_rule_set_approval`', '`save_market_calendar` (ERR_CALENDAR_HAS_DATA, ERR_CALENDAR_PAST_DATE)', 'Cron `activate_rule_sets` 00:00 JST'],
  dod: ['pgTAP: sửa bản `active` → ERR_RULE_SET_NOT_DRAFT', 'pgTAP: `effective_from` < ngày mai JST → ERR_EFFECTIVE_FROM_TOO_EARLY; trùng ngày → ERR_EFFECTIVE_FROM_CONFLICT', 'pgTAP: thiếu key khi duyệt → ERR_RULE_KEY_MISSING; giá trị sai kiểu → ERR_RULE_VALUE_INVALID'],
});
L('T-04-01-c', 'I-04-01', 'fe', 'SC-11 danh sách phiên bản + RuleValueEditor 8 kiểu + cột so sánh + duyệt', {
  role: 'FE-1', ph: 2, c: '業務規程 có phiên bản', dep: ['T-04-01-b', 'T-01-03-a'],
  g: 'ADM soạn, so sánh và duyệt phiên bản 業務規程.',
  s: 'SC-11 § 3–§ 7',
  sc: ['Danh sách phiên bản + trạng thái', 'Trang phiên bản: editor 8 kiểu (%, JPY, ngày, năm, enum, JSON bậc, danh sách mã, giờ) có validate zod', 'Cột so sánh với phiên bản trước; hộp thoại duyệt; cảnh báo rời trang khi chưa lưu'],
  dod: ['Editor bậc thưởng chặn JSON sai (min trùng, rate < 0)', 'W-ACC chỉ xem'],
});
L('T-04-01-d', 'I-04-01', 'fe', 'SC-11 tab lịch chợ 休市日 (chọn nhiều ngày)', {
  role: 'FE-1', ph: 2, c: '業務規程 có phiên bản', dep: ['T-04-01-b'],
  g: 'Quản lý ngày nghỉ chợ theo tháng.',
  s: 'SC-11 § 3 (tab lịch); BR-40; A-09',
  sc: ['Lịch tháng chọn nhiều ngày, lưu một lần', 'Hiển thị lỗi khi ngày đã có dữ liệu nghiệp vụ'],
  dod: ['Đặt 休市日 cho ngày đã có lô → hiện ERR_CALENDAR_HAS_DATA'],
});
I('I-04-02', 'E04', 'SC-08 Danh mục 品目・規格', {
  g: 'Quản lý loại cá, quy cách và kênh bán mặc định.',
  s: 'SC-08, FT-05',
  dod: ['Mã 品目 không đổi được sau khi dùng', 'W-FLR chỉ xem'],
});
L('T-04-02-a', 'I-04-02', 'rpc', 'Migration fish_species / species_standards + RPC upsert/delete + pgTAP', {
  role: 'BE-2', ph: 2, dep: ['T-01-02-c'],
  g: 'Danh mục 品目 TO-BE với khóa mã.',
  s: 'SC-08 Ghi chú LAB-5',
  sc: ['Sửa `fish_species` (thêm cột, bỏ `name_vn`), tạo `species_standards`, trigger khóa `code`', 'Seed lại 5 loại có mã', '`upsert_species`, `upsert_species_standard`, `delete_species_standard`'],
  dod: ['pgTAP: quyền ADM/W-MGR; trùng mã → ERR_DUPLICATE_CODE; xóa 規格 đang dùng → ERR_IN_USE; đổi mã → ERR_CODE_IMMUTABLE'],
});
L('T-04-02-b', 'I-04-02', 'fe', 'Trang /master/species hai cột + bảng 規格 sửa tại dòng (khung List+Form dùng chung)', {
  role: 'FE-2', ph: 2, dep: ['T-04-02-a', 'T-01-03-a'],
  g: 'Màn danh mục 品目 và khung List+Form tái dùng cho SC-12.',
  s: 'SC-08 § 3–§ 7',
  sc: ['Khung `MasterListForm` (list trái, form phải)', 'Bảng 規格 sửa tại dòng; chế độ chỉ xem theo vai trò', 'Badge E13 đọc `fn_rule`'],
  dod: ['E2E: W-FLR chỉ xem, không thấy nút lưu'],
});
I('I-04-03', 'E04', 'SC-09 Danh mục tàu・荷主', {
  g: 'Tách 荷主 khỏi tàu; thông tin ngân hàng chỉ kế toán/quản lý sửa.',
  s: 'SC-09, FT-06, GAP-19, D-23, D-26',
  dod: ['3 tàu seed LAB-2 có 荷主 tương ứng', 'W-FLR không sửa được 振込先'],
});
L('T-04-03-a', 'I-04-03', 'rpc', 'Migration shippers + vessels + view che số tài khoản + RPC upsert_shipper / upsert_vessel', {
  role: 'BE-2', ph: 2, dep: ['T-01-02-c'],
  g: 'Mô hình chủ hàng đầy đủ để quyết toán (GAP-19).',
  s: 'SC-09 Ghi chú LAB-5; GAP-19; D-23; D-26; decision-log § 2 (v_shippers_masked)',
  sc: ['`shippers` (+account_holder_kana, is_active), sửa `vessels` (+is_active, CHECK code `^[A-Z0-9]{2,5}$`)', 'Script chuyển `owner_name` 3 tàu seed → 3 荷主', 'View `v_shippers_masked` che số tài khoản theo functions', 'RPC kiểm quyền theo trường ngân hàng'],
  dod: ['pgTAP: W-FLR sửa trường bank → ERR_FORBIDDEN', 'pgTAP: đổi mã tàu đã dùng → ERR_CODE_IMMUTABLE; số T sai → ERR_INVALID_REG_NO'],
});
L('T-04-03-b', 'I-04-03', 'fe', 'SC-09 trang hai tab 船 / 荷主 + modal tàu + che số tài khoản', {
  role: 'FE-2', ph: 2, dep: ['T-04-03-a', 'T-04-02-b'],
  g: 'Màn danh mục tàu và chủ hàng.',
  s: 'SC-09 § 3–§ 7',
  sc: ['Tab 荷主 / 船, modal tàu', 'Số tài khoản che theo vai trò'],
  dod: ['E2E: W-FLR không sửa được 振込先'],
});
I('I-04-04', 'E04', 'SC-10 Danh mục người tham gia: đình chỉ và hạn mức', {
  c: 'Quyền mua 2 cấp',
  g: 'ADM quản lý người tham gia, 取引停止 có lịch sử và hạn mức tín dụng.',
  s: 'SC-10, FT-07, BR-05, BR-06, BR-25, GAP-01, D-23',
  dod: ['Đình chỉ → SC-18 từ chối với thông điệp tiếng Nhật', 'Tier chỉ hiển thị, không sửa'],
});
L('T-04-04-a', 'I-04-04', 'rpc', 'trading_suspensions + v_participant_master + RPC suspend / lift / set_credit_limit / update_participant', {
  role: 'BE-1', ph: 2, c: 'Quyền mua 2 cấp', dep: ['T-01-02-c', 'T-03-01-a'],
  g: 'Ghi đình chỉ thành bản ghi riêng có lý do; hạn mức chỉ ADM sửa.',
  s: 'SC-10 Ghi chú LAB-5; BR-05; BR-06; D-23; Q29',
  sc: ['`trading_suspensions` (+lift_reason), view `v_participant_master` (tier, tư cách hiện tại, đình chỉ, hạn mức)', 'RPC `suspend_participant`, `lift_suspension`, `set_credit_limit`, `update_participant`'],
  dod: ['pgTAP: chỉ ADM; đình chỉ 2 lần → ERR_ALREADY_SUSPENDED; gỡ khi không đình chỉ → ERR_NOT_SUSPENDED', 'pgTAP: update_participant không đổi được tier/kind', 'pgTAP: đình chỉ KAI → ERR_NOT_BUYER (theo Q29 mặc định)'],
});
L('T-04-04-b', 'I-04-04', 'fe', 'SC-10 danh sách + chi tiết theo kind + modal lý do + lịch sử đình chỉ', {
  role: 'FE-1', ph: 2, dep: ['T-04-04-a', 'T-01-03-a'],
  g: 'Màn người tham gia thay cho trang PATCH LAB-2.',
  s: 'SC-10 § 3–§ 7',
  sc: ['Danh sách + chi tiết biến thể theo `kind`', 'Modal đình chỉ/gỡ có lý do; lịch sử đình chỉ', 'Xóa nút PATCH LAB-2'],
  dod: ['E2E: W-ACC chỉ xem', 'E2E (sau T-06-02-c): đình chỉ SBK-02 → SC-18 từ chối với thông điệp JP'],
});
I('I-04-05', 'E04', 'SC-12 Bảng mã 符丁', {
  pr: 'Should', c: 'HITL 目利き/符丁',
  g: 'Danh mục ký hiệu riêng của chợ để gắn cho lô.',
  s: 'SC-12, FT-09, BR-13, GAP-07, D-26',
  dod: ['符丁 vô hiệu không hiện ở SC-15 nhưng lô cũ vẫn hiện nhãn'],
});
L('T-04-05-a', 'I-04-05', 'rpc', 'Migration market_marks + RPC upsert_market_mark + pgTAP', {
  role: 'BE-2', ph: 2, pr: 'Should', c: 'HITL 目利き/符丁', dep: ['T-01-02-c'],
  g: 'Danh mục 符丁 có khóa mã khi đã dùng.',
  s: 'SC-12 Ghi chú LAB-5; GAP-07; D-26',
  sc: ['Bảng `market_marks` + trigger khóa `code` khi đã dùng', 'RPC `upsert_market_mark` (W-FLR chỉ R theo D-26)'],
  dod: ['pgTAP: W-FLR ghi → ERR_FORBIDDEN; trùng mã → ERR_DUPLICATE_CODE; đổi mã đã dùng → ERR_CODE_IMMUTABLE'],
});
L('T-04-05-b', 'I-04-05', 'fe', 'Trang /master/marks dùng khung List+Form', {
  role: 'FE-2', ph: 2, pr: 'Should', c: 'HITL 目利き/符丁', dep: ['T-04-05-a', 'T-04-02-b'],
  g: 'Màn quản lý 符丁.',
  s: 'SC-12 § 3–§ 7',
  sc: ['List + form dùng `MasterListForm`', 'Bật/tắt hiệu lực'],
  dod: ['E2E (sau T-05-02-c): 符丁 無効 không hiện ở SC-15, lô cũ vẫn hiện nhãn'],
});
