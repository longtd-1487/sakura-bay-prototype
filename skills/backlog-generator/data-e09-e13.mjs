import { E, I, L } from './lib.mjs';

// ───────────── E09 Hóa đơn, tiền về, khóa kỳ ─────────────
E('E09', 'E09 Hóa đơn, tiền về, khóa kỳ', {
  c: 'Khóa kỳ 締め',
  scope: ['Kỳ chốt `billing_periods` + trigger khóa kỳ (ADR-012)', 'SC-27 chốt kỳ & phát hành 請求書, SC-28 chi tiết + void/phát hành lại, SC-29 入金・消込, SC-33 khóa kỳ', 'Nhắc hạn / 期限超過 (FT-30)'],
  s: 'SC-27, SC-28, SC-29, SC-33, ADR-011, ADR-012, BR-21…BR-26, BR-29, GAP-05, GAP-11, GAP-12, GAP-13, GAP-14, D-03, D-09, D-14, FT-28, FT-29, FT-30, FT-35',
  notes: ['Sau khóa kỳ: không sửa giao dịch, số tiền hóa đơn, 仕切書; **ngoại lệ D-09**: vẫn ghi tiền về trễ và 消込', 'W-ACC chạy 締め処理, ADM khóa / mở lại kỳ (D-03)', 'Phần khấu trừ 完納奨励金 trong close_period thuộc E10 (T-10-04-a)'],
});
I('I-09-01', 'E09', 'SC-33 Kỳ chốt và khóa kỳ 締め確定', {
  c: 'Khóa kỳ 締め',
  g: 'Kỳ chốt là thực thể riêng; khóa kỳ chặn ghi ở DB; mở lại có lý do.',
  s: 'SC-33, ADR-012, BR-29, D-03, D-09, D-14, GAP-12, FT-35, Q36',
  dod: ['Sau khóa: sửa giao dịch/hóa đơn/仕切書 → ERR_PERIOD_LOCKED; 消込 vẫn được', 'Không khóa được khi còn điều kiện BR-29 chưa đạt'],
});
L('T-09-01-a', 'I-09-01', 'db', 'billing_periods + cron tạo kỳ + trg_block_locked_period (ngoại lệ D-09)', {
  role: 'BE-1', ph: 3, c: 'Khóa kỳ 締め', dep: ['T-04-01-a', 'T-01-02-c'],
  g: 'Nền kỳ chốt cho hóa đơn, 仕切書, thưởng (sửa GAP-12).',
  s: 'ADR-012 Việc phải làm; SC-33 Ghi chú LAB-5 DB; D-09; D-14; GAP-12; BR-29',
  sc: ['`billing_periods` (period_start/end, status open/closing/locked, closed_at/by, incentives_calculated_at, locked/reopened_*)', 'Cron tạo kỳ theo `closing_cycle` của 業務規程', 'Hàm trigger `trg_block_locked_period` gắn `transactions`, `invoices` (settlements gắn ở T-11-01-a); ngoại lệ ghi `payments`, `payment_allocations`, `invoices.status`'],
  dod: ['pgTAP: kỳ locked → update `transactions` của kỳ → ERR_PERIOD_LOCKED', 'pgTAP: kỳ locked → đổi `invoices.status` sang paid vẫn được, đổi `total` bị chặn'],
});
L('T-09-01-b', 'I-09-01', 'rpc', 'check_period_lock / lock_period / reopen_period + pgTAP', {
  role: 'BE-2', ph: 5, c: 'Khóa kỳ 締め', dep: ['T-09-01-a', 'T-09-02-b', 'T-11-01-c', 'T-10-03-a'],
  g: 'Khóa kỳ theo checklist BR-29, mở lại có lý do.',
  s: 'SC-33 Implementation Mapping; SC-33 Ghi chú LAB-5 RPC; BR-29; D-03; Q36',
  sc: ['`check_period_lock` trả blocking: UNINVOICED_TX, VOID_NOT_REISSUED, SETTLEMENT_PENDING, INCENTIVE_PENDING, INCENTIVE_NOT_CALCULATED, PENDING_CORRECTION + info', 'Info thêm: tiền về có `received_on` ≤ hạn nhưng chưa 消込 (ảnh hưởng 完納)', '`lock_period` (ADM), `reopen_period` (ADM, lý do, ERR_LATER_PERIOD_LOCKED)'],
  dod: ['pgTAP: còn thưởng `calculated` → ERR_LOCK_PRECONDITION', 'pgTAP: `incentives_calculated_at` null → chặn (INCENTIVE_NOT_CALCULATED)', 'pgTAP: mở lại ghi audit có reason; W-ACC gọi → ERR_FORBIDDEN'],
});
L('T-09-01-c', 'I-09-01', 'fe', 'SC-33 danh sách kỳ + checklist + modal khóa / mở lại', {
  role: 'FE-1', ph: 5, c: 'Khóa kỳ 締め', dep: ['T-09-01-b'],
  g: 'ADM thấy vì sao chưa khóa được và khóa/mở kỳ.',
  s: 'SC-33 § 3–§ 7',
  sc: ['Danh sách kỳ + trạng thái', 'Checklist C1–C5 có link sang SC-27/28/31/32', 'Modal khóa; modal mở lại bắt buộc lý do'],
  dod: ['Checklist khớp `check_period_lock`', 'W-ACC/W-MGR chỉ xem'],
});
L('T-09-01-d', 'I-09-01', 'test', 'Hồi quy chéo khóa kỳ + GAP-11 (phí chỉ ở 仕切書)', {
  role: 'QA', ph: 5, c: 'Khóa kỳ 締め', dep: ['T-09-01-c', 'T-09-03-b', 'T-11-01-e', 'T-06-03-c', 'T-09-04-d'],
  g: 'Chứng minh khóa kỳ chặn đúng chỗ và phí hoa hồng đã chuyển phía chủ hàng.',
  s: 'SC-33 Ghi chú LAB-5 (Hồi quy chéo); SC-31 Ghi chú LAB-5 (Gỡ GAP-11); GAP-11; D-09; X-6',
  sc: ['Kỳ khóa: SC-18 sửa sau chốt, SC-28 void, SC-31 phát hành đều bị chặn; SC-29 vẫn 消込 được', 'Cùng một kỳ: hóa đơn bên mua không có 手数料; 仕切書 có trừ 委託手数料 5.5%'],
  dod: ['E2E + pgTAP xanh trên staging'],
});
I('I-09-02', 'E09', 'SC-27 Chốt kỳ và phát hành 請求書', {
  g: 'W-ACC chốt kỳ: mỗi bên mua một hóa đơn, thuế 8%, không phí, số không trùng, PDF 適格請求書.',
  s: 'SC-27, FT-28, FT-30, BR-21, BR-22, BR-24, BR-25, GAP-05, GAP-11, GAP-12, GAP-13, A-04, A-05',
  dod: ['Chốt 2 lần không ra hóa đơn trùng', 'Tổng hóa đơn ≥ 0, không có 手数料'],
});
L('T-09-02-a', 'I-09-02', 'db', 'Migration invoices TO-BE + invoice_no_seq theo kỳ + unique partial + v_invoice_status + RLS', {
  role: 'BE-1', ph: 3, dep: ['T-09-01-a'],
  g: 'Bảng hóa đơn đúng ràng buộc tiền (sửa GAP-12, GAP-13).',
  s: 'SC-27 Ghi chú LAB-5 DB; BR-21; BR-22; BR-24; BR-25; GAP-05; GAP-12; GAP-13',
  sc: ['`invoices` (goods_amount, tax_rate, tax_amount, incentive_deduction, total, due_date, status, rule_set_id, pdf_path, void_reason, replaced_by)', 'UNIQUE (buyer_id, period_id) WHERE status ≠ void; CHECK total ≥ 0; CHECK incentive_deduction ≤ goods_amount', 'Sequence số `INV-YYYYMM-NNNN` theo kỳ', 'View `v_invoice_status` (is_overdue theo JST, remaining) + RLS bên mua'],
  dod: ['pgTAP: hai hóa đơn không void cùng buyer×kỳ → lỗi', 'pgTAP: total âm → lỗi CHECK', 'pgTAP: NAK-A không đọc hóa đơn NAK-B'],
});
L('T-09-02-b', 'I-09-02', 'rpc', 'preview_close_period + close_period (gom giao dịch, thuế, hạn theo 業務規程 ngày chốt)', {
  role: 'BE-1', ph: 5, c: '業務規程 có phiên bản', dep: ['T-09-02-a', 'T-06-02-b', 'T-07-02-a'],
  g: 'Chốt kỳ đúng BR-21/BR-24, không còn phí bên mua (sửa GAP-11 phía hóa đơn).',
  s: 'SC-27 Implementation Mapping; SC-27 Ghi chú LAB-5 RPC; BR-21; BR-22; BR-24; GAP-05; GAP-11; GAP-13; A-04; A-05; Q18',
  sc: ['Gom `transactions` concluded, `invoice_id` null, `business_date` ∈ kỳ, theo bên mua', '`rule_set_id` = phiên bản hiệu lực ngày chốt; `tax = floor(goods × rate / 100)` (chờ I-00-01); `due = period_end + payment_due_days`', 'Chặn khi còn 交渉中 / yêu cầu sửa chờ (ERR_PERIOD_HAS_PENDING); thiếu số T → ERR_ISSUER_NOT_REGISTERED; kỳ chưa hết → ERR_PERIOD_NOT_ENDED', 'Gọi hook khấu trừ thưởng `fn_apply_incentives` (T-10-04-a); status kỳ → `closing`; enqueue email `invoice_issued`'],
  dod: ['pgTAP: chạy close_period 2 lần → không hóa đơn trùng', 'pgTAP: không có 手数料 trên hóa đơn (GAP-11); tổng ≥ 0 (GAP-13)', 'pgTAP: 2 phiên song song → số không trùng (GAP-05)', 'pgTAP: phiên bản 業務規程 v4 duyệt hôm nay hiệu lực mai → hóa đơn chốt hôm nay lưu v3'],
});
L('T-09-02-c', 'I-09-02', 'infra', 'PDF 請求書 適格請求書 + attach_invoice_pdf + email invoice_issued', {
  role: 'FE-2', ph: 5, dep: ['T-09-02-b', 'T-01-04-a', 'T-01-04-b'],
  g: 'Phát hành chứng từ bất biến đủ mục bắt buộc インボイス.',
  s: 'SC-28 PDF mapping; SC-27 Ghi chú LAB-5 (PDF + email); ADR-011; A-04; Q10',
  sc: ['Template: tên + số T người phát hành, ngày giao dịch, ※ 軽減税率対象, tổng/thuế theo thuế suất, khấu trừ 完納奨励金, kỳ, hạn, phiên bản 業務規程', '`attach_invoice_pdf` lưu `pdf_path` một lần (không ghi đè)', 'Email `invoice_issued` kèm link signed URL'],
  dod: ['Snapshot test với ví dụ SC-28 (¥1,338,200)', 'Gọi attach lần 2 → lỗi (bất biến)'],
});
L('T-09-02-d', 'I-09-02', 'fe', 'SC-27 danh sách hóa đơn + lọc URL + hộp thoại xem trước chốt kỳ + cờ 期限超過', {
  role: 'FE-2', ph: 5, dep: ['T-09-02-b'],
  g: 'Kế toán xem và chốt kỳ; bên mua xem hóa đơn của mình.',
  s: 'SC-27 § 3–§ 7; BR-25',
  sc: ['Chọn kỳ từ `billing_periods` (bỏ tính kỳ theo đồng hồ client LAB-2)', 'Hộp thoại `preview_close_period` (số bên mua, tiền hàng, thuế, khấu trừ, hạn, phiên bản)', 'Cờ 期限超過 từ `v_invoice_status`; bỏ cột 手数料'],
  dod: ['E2E: W-ACC chốt kỳ → danh sách hiện hóa đơn mới', 'NAK chỉ thấy hóa đơn của mình'],
});
L('T-09-02-e', 'I-09-02', 'rpc', 'Job nhắc hạn thanh toán (payment_reminder_days) + thông báo quá hạn cho ADM', {
  role: 'BE-2', ph: 5, dep: ['T-09-02-a', 'T-01-04-b'],
  g: 'Nhắc hạn bằng email; quá hạn chỉ gắn cờ, đình chỉ là quyết định thủ công.',
  s: 'BR-25; FT-30; FT-41; SC-27; SC-10',
  sc: ['Cron 0:05 JST enqueue nhắc trước `payment_reminder_days` cho hóa đơn chưa trả đủ', 'Danh sách quá hạn cho ADM trên SC-03 (link SC-10 đình chỉ)'],
  dod: ['pgTAP: không nhắc hóa đơn đã `paid`/`void`; không nhắc trùng khi cron chạy lại'],
});
I('I-09-03', 'E09', 'SC-28 Chi tiết 請求書, PDF và void / phát hành lại', {
  g: 'Xem chi tiết hóa đơn; hủy có lý do và phát hành lại số mới, chuyển 消込 và thưởng sang hóa đơn mới.',
  s: 'SC-28, FT-28, FT-38, BR-23, BR-24, ADR-011, Q24',
  dod: ['Hóa đơn cũ giữ số, có watermark 取消', '消込 và khấu trừ thưởng chuyển đủ sang hóa đơn mới'],
});
L('T-09-03-a', 'I-09-03', 'rpc', 'preview_reissue_invoice + void_and_reissue_invoice + pgTAP', {
  role: 'BE-2', ph: 5, c: 'Khóa kỳ 締め', dep: ['T-09-02-b', 'T-09-04-b'],
  g: 'Sửa hóa đơn bằng hủy + phát hành lại trong một transaction (BR-23).',
  s: 'SC-28 Implementation Mapping E20/E21; SC-28 Ghi chú LAB-5 RPC; BR-23',
  sc: ['Kiểm quyền → kỳ chưa locked → cũ `void` + `replaced_by` → gỡ `transactions.invoice_id` → tạo mới cùng `rule_set_id` → chuyển `payment_allocations`', 'Gọi hook relink thưởng (T-10-04-b)', 'Audit có reason; enqueue email'],
  dod: ['pgTAP: số mới khác số cũ; allocations chuyển đủ', 'pgTAP: kỳ locked → ERR_PERIOD_LOCKED; mới < đã 消込 → ERR_REISSUE_BELOW_ALLOCATED'],
});
L('T-09-03-b', 'I-09-03', 'fe', 'SC-28 trang chi tiết + modal void + watermark 取消 + tải PDF', {
  role: 'FE-1', ph: 5, dep: ['T-09-03-a', 'T-09-02-c'],
  g: 'Màn chi tiết hóa đơn cho kế toán và bên mua.',
  s: 'SC-28 § 3–§ 7',
  sc: ['Từng giao dịch, thuế, khấu trừ thưởng (E11), tiền đã về', 'Modal void + xem trước số mới (`preview_reissue_invoice`)', 'PDF qua signed URL 300 giây'],
  dod: ['Bên mua không thấy nút void', 'Hóa đơn void hiển thị link sang hóa đơn thay thế'],
});
I('I-09-04', 'E09', 'SC-29 Ghi nhận 入金 và 消込', {
  g: 'Nhập tay hoặc import sao kê; gợi ý khớp; một khoản chia nhiều hóa đơn; không trả vượt; ngày tiền về là ngày sao kê.',
  s: 'SC-29, FT-29, BR-26, D-09, GAP-14, Q13, Q21',
  dod: ['Không ghi nhận trả vượt', 'Kỳ đã khóa vẫn 消込 được (D-09)'],
});
L('T-09-04-a', 'I-09-04', 'db', 'Migration payments / payment_imports / payment_allocations + trigger Σ không trả vượt', {
  role: 'BE-1', ph: 5, dep: ['T-09-02-a'],
  g: 'Mô hình tiền về và 消込 đúng (sửa GAP-14).',
  s: 'SC-29 Ghi chú LAB-5 DB; BR-26; GAP-14; decision-log § 2 (source_row_hash, column_mapping)',
  sc: ['`payments` (received_on, payer_name, amount, method, match_status), `payment_imports` (+column_mapping)', '`payment_allocations` + trigger Σ theo payment ≤ amount và Σ theo invoice ≤ total; cập nhật `invoices.status`', '`source_row_hash` UNIQUE chống import trùng'],
  dod: ['pgTAP: phân bổ vượt hóa đơn → ERR_OVER_ALLOCATION', 'pgTAP: import cùng dòng 2 lần → bỏ qua dòng trùng'],
});
L('T-09-04-b', 'I-09-04', 'rpc', 'record_payment / allocate_payment / unallocate_payment / suggest_payment_matches', {
  role: 'BE-2', ph: 5, c: '完納奨励金', dep: ['T-09-04-a'],
  g: 'Ghi và đối chiếu tiền về, chặn hủy 消込 mà thưởng đã duyệt dựa vào.',
  s: 'SC-29 Implementation Mapping; SC-29 Ghi chú LAB-5 RPC; BR-26; BR-27; D-09; GAP-14',
  sc: ['`record_payment`, `allocate_payment` (một khoản chia nhiều hóa đơn), `unallocate_payment` (lý do)', '`unallocate_payment` → ERR_INCENTIVE_DEPENDS nếu thưởng kỳ đó đã approved/applied', '`suggest_payment_matches` theo số tiền + tên người chuyển (kana)'],
  dod: ['pgTAP: một khoản chia hai hóa đơn; trả vượt bị chặn; hai phiên song song (GAP-14)', 'pgTAP: kỳ locked vẫn allocate được (D-09)', 'pgTAP: unallocate khi thưởng approved → ERR_INCENTIVE_DEPENDS'],
});
L('T-09-04-c', 'I-09-04', 'rpc', 'import_bank_statement + parser 全銀 / CSV chung có mapping', {
  role: 'BE-2', ph: 5, dep: ['T-09-04-b', 'I-00-07'],
  g: 'Nhập sao kê ngân hàng thay vì gõ tay.',
  s: 'SC-29 Ghi chú LAB-5 Parser; architecture § 5 I-1; Q13',
  sc: ['Parser 全銀 (fixed-length, Shift_JIS) + CSV chung với `column_mapping` lưu lại', '`import_bank_statement` ghi `payment_imports` + `payments`'],
  dod: ['Vitest với file mẫu ngân hàng khách (fixture từ I-00-07)', 'Sai encoding / thiếu cột → báo dòng lỗi, không ghi nửa chừng'],
});
L('T-09-04-d', 'I-09-04', 'fe', 'SC-29 ba tab (nhập tay / import / 消込) + bảng phân bổ tính trực tiếp', {
  role: 'FE-1', ph: 5, dep: ['T-09-04-b'],
  g: 'Màn tiền về và đối chiếu cho kế toán.',
  s: 'SC-29 § 3–§ 7',
  sc: ['Tab nhập tay, tab import (chọn mapping), tab 消込 với gợi ý', 'Bảng phân bổ cập nhật số còn lại ngay khi gõ'],
  dod: ['E2E: một khoản ¥ chia 2 hóa đơn → cả hai `入金済`', 'Hiển thị ERR_INCENTIVE_DEPENDS nguyên văn'],
});

// ───────────── E10 完納奨励金 ─────────────
E('E10', 'E10 完納奨励金 — thưởng thanh toán đủ & đúng hạn', {
  c: '完納奨励金',
  scope: ['Bằng chứng theo bên mua × kỳ, quy tắc 完納 (kể cả trường hợp biên), bậc thưởng theo 業務規程 có phiên bản', 'RPC tính (idempotent, chặn trước hạn), duyệt / từ chối của ADM', 'Khấu trừ vào hóa đơn kỳ sau qua `incentive_applications` (cap ≤ tiền hàng, chuyển tiếp phần dư)', 'SC-32 giao diện, 完納率 trên SC-35/SC-03, hồi quy E2E 2 kỳ'],
  s: 'SC-32, SC-28, SC-27, SC-33, SC-35, SC-03, BR-24, BR-26, BR-27, BR-29, ADR-004, ADR-005, GAP-13, GAP-22, D-02, D-09, D-11, D-12, D-14, A-06, US-14, FT-33',
  notes: ['Bắt buộc theo đề: logic nhiều biến → tách task nhỏ, không gộp', 'Máy tính, người quyết định: tính chỉ tạo `calculated`, ADM duyệt (D-02 tách người tính/người duyệt)', 'Bằng chứng là ảnh chụp lúc tính; thưởng dùng phiên bản 業務規程 tại ngày chốt kỳ', '出荷奨励金 (BR-33, Should) thuộc E11'],
});
I('I-10-01', 'E10', 'Dữ liệu thưởng và bảng bằng chứng theo bên mua × kỳ', {
  c: '完納奨励金',
  g: 'Có schema thưởng TO-BE và một nguồn số liệu bằng chứng dùng chung cho tính toán, SC-32 và báo cáo.',
  s: 'SC-32 Implementation Mapping R4 + DB_GAP E22; D-11; D-14; GAP-22; BR-27',
  dod: ['`applied_invoice_id` không còn trong schema', 'Bảng bằng chứng gồm cả bên mua không đạt'],
});
L('T-10-01-a', 'I-10-01', 'db', 'Migration incentives TO-BE + incentive_applications (trigger Σ ≤ amount) + RLS', {
  role: 'BE-1', ph: 5, c: '完納奨励金', dep: ['T-09-02-a', 'T-01-05-b'],
  g: 'Lưu thưởng và từng lần khấu trừ (sửa GAP-22 theo D-11).',
  s: 'database-diagram incentives + incentive_applications; D-11; D-14; GAP-22; BR-27; SC-32 Security Surface; SC-32 Lock check',
  sc: ['`incentives`: kind, participant_id/shipper_id, period_id, rule_set_id, base_amount, rate, amount, evidence jsonb, status calculated/approved/rejected/applied, decided_by/at, decision_note; bỏ `applied_invoice_id`; UNIQUE (kind, participant/shipper, period)', '`incentive_applications(incentive_id, invoice_id?, settlement_id?, amount > 0, applied_at)` + CHECK đúng một đích; **trigger** Σ amount ≤ incentives.amount (không làm được bằng CHECK)', 'RLS: W-ACC/W-MGR/ADM đọc tất cả; NAK/SBK chỉ của mình và status ∈ approved/applied/rejected', '`trg_block_locked_period` **không** chặn `incentives` / `incentive_applications` (thưởng kỳ N chuyển applied khi chốt N+1)'],
  dod: ['pgTAP: Σ applications vượt amount → lỗi', 'pgTAP: application có cả invoice_id và settlement_id → lỗi CHECK', 'pgTAP: SBK thấy dòng approved của mình, không thấy calculated, không thấy của người khác'],
});
L('T-10-01-b', 'I-10-01', 'rpc', 'Bằng chứng 完納 theo bên mua × kỳ: fn_incentive_evidence + RPC incentive_evidence', {
  role: 'BE-2', ph: 5, c: '完納奨励金', dep: ['T-10-01-a', 'T-09-04-a'],
  g: 'Tính một lần các biến đầu vào: tổng hóa đơn, tổng đã khớp, ngày tiền về cuối, hạn, doanh số chưa thuế.',
  s: 'SC-32 Implementation Mapping R4/E04; SC-32 E07–E12, E20; BR-26; BR-27; ADR-005',
  sc: ['`fn_incentive_evidence(period_id)` trả mỗi bên mua có hóa đơn kỳ: invoiced = Σ total (≠ void), paid = Σ payment_allocations, last_received_on = max(payments.received_on), due_date (của hóa đơn hiệu lực), goods = Σ goods_amount, rule_set_id (của hóa đơn)', 'RPC đọc `incentive_evidence(p_period_id, p_kind)` = evidence ⋈ incentives (nếu có), gồm cả người không đạt', 'Danh sách hóa đơn + tiền về cho panel R5'],
  dod: ['pgTAP với 3 bên mua ví dụ SC-32: NAK-001 (¥1,274,400 / ¥1,274,400 / 10/14), SBK-018 (10/17), NAK-007 (¥2,000,000 / ¥2,160,000)', 'pgTAP: hóa đơn void không tính vào invoiced; hóa đơn thay thế được tính', 'pgTAP: NAK gọi cho kỳ → chỉ dòng của mình'],
});
I('I-10-02', 'E10', 'Quy tắc 完納 và bậc thưởng theo 業務規程 có phiên bản', {
  c: '完納奨励金',
  g: 'Định nghĩa 完納 và tỷ lệ thưởng nằm trong hai hàm thuần, test đủ trường hợp biên, dùng chung cho SC-32 và báo cáo.',
  s: 'BR-27, BR-26, ADR-004, A-06, Q20, X-7, SC-35 E07',
  dod: ['SC-32, SC-35, SC-03 gọi cùng hàm', 'Đổi bậc trong phiên bản mới không đổi thưởng kỳ cũ'],
});
L('T-10-02-a', 'I-10-02', 'rpc', 'Hàm fn_is_kannou + pgTAP trường hợp biên (một phần, đúng hạn, trễ 1 ngày, void, D-09)', {
  role: 'BE-1', ph: 5, c: '完納奨励金', dep: ['T-10-01-b'],
  g: 'Phán định 完納 = paid ≥ invoiced **và** last_received_on ≤ due_date, kèm mã lý do không đạt.',
  s: 'BR-27; BR-26; D-09; X-7; SC-32 E11; SC-29 Interaction Notes ("ngày tiền về là ngày sao kê"); A-06',
  sc: ['`fn_is_kannou(evidence) → (ok bool, reason)` với reason: 完納 / 一部入金 / 期限後入金 / 未入金', 'So sánh ngày theo JST; không có hóa đơn → không thuộc đối tượng', 'Dùng `received_on` (ngày sao kê), không dùng ngày bấm 消込'],
  dod: ['pgTAP: trả đủ đúng hạn → 完納', 'pgTAP: trả thiếu ¥1 → 一部入金; chưa trả → 未入金', 'pgTAP: tiền về **đúng ngày hạn** → 完納; trễ 1 ngày → 期限後入金', 'pgTAP: trả vượt không thể xảy ra (trigger T-09-04-a) → test khẳng định insert vượt bị lỗi', 'pgTAP: hóa đơn void + phát hành lại → chỉ tính hóa đơn mới, hạn của hóa đơn mới', 'pgTAP: tiền về ≤ hạn nhưng 消込 sau khi kỳ khóa (D-09) → 完納 nếu tính lại; nhiều hóa đơn một bên mua → gộp'],
});
L('T-10-02-b', 'I-10-02', 'rpc', 'Hàm fn_incentive_rate: bậc incentive_tiers theo phiên bản 業務規程 tại ngày chốt', {
  role: 'BE-2', ph: 5, c: '業務規程 có phiên bản', dep: ['T-04-01-a', 'T-10-01-b'],
  g: 'Lấy tỷ lệ từ `incentive_tiers` của đúng phiên bản đã áp cho hóa đơn kỳ (BR-27, ADR-004).',
  s: 'BR-27; BR-21; ADR-004; SC-32 E03; SC-32 Implementation Mapping (Bậc); Q20; business-rules § 1 incentive_tiers',
  sc: ['`fn_incentive_rate(base, rule_set_id)`: bậc cao nhất có `min ≤ base` (một tỷ lệ cho toàn bộ — Q20 mặc định)', 'rule_set_id = `invoices.rule_set_id` (phiên bản tại ngày chốt), **không** dùng `fn_rule(..., period_end)` như SC-32 E03 đang ghi', '`amount = floor(base × rate / 100)`; validate JSON (min tăng dần, rate 0–100)'],
  dod: ['pgTAP: base đúng bằng ngưỡng bậc → lấy bậc đó; dưới ngưỡng 1 yên → bậc dưới', 'pgTAP: v3 (1%) hiệu lực khi chốt, v4 (2%) hiệu lực sau → dùng 1%', 'pgTAP: tiers rỗng → rate 0, không tạo dòng thưởng', 'pgTAP: ví dụ ¥1,180,000 × 1% = ¥11,800'],
});
I('I-10-03', 'E10', 'Tính và duyệt 完納奨励金', {
  c: '完納奨励金',
  g: 'W-ACC/W-MGR tính sau hạn thanh toán; ADM duyệt hoặc từ chối có lý do; không có đường tự duyệt.',
  s: 'SC-32 E04, E17–E19, BR-27, D-02, PERM-07, US-14',
  dod: ['Tính lại không đổi dòng đã quyết định', 'Kế toán không tự duyệt được'],
});
L('T-10-03-a', 'I-10-03', 'rpc', 'calculate_incentives(completion): chặn trước hạn, idempotent, snapshot bằng chứng', {
  role: 'BE-1', ph: 5, c: '完納奨励金', dep: ['T-10-02-a', 'T-10-02-b'],
  g: 'Ghi dòng `calculated` cho bên mua đạt 完納 kèm bằng chứng tại thời điểm tính.',
  s: 'SC-32 Implementation Mapping E04; SC-32 § 4 Branches; SC-33 DB_GAP E07; BR-27; D-14; ADR-005',
  sc: ['Kiểm W-ACC/W-MGR; kỳ `closing`; JST hôm nay > max(due_date) → ngược lại ERR_BEFORE_DUE; kỳ chưa chốt → ERR_PERIOD_NOT_CLOSED; locked → ERR_PERIOD_LOCKED', 'Upsert theo (kind, participant, period), chỉ đụng dòng `calculated`; dòng `calculated` không còn đạt → xóa; dòng approved/rejected giữ nguyên', 'Ghi `evidence` jsonb + `rule_set_id`; set `billing_periods.incentives_calculated_at`', 'Idempotent theo `p_client_request_id`; trả `{evaluated, qualified, total_amount}`'],
  dod: ['pgTAP: 3 ví dụ SC-32 → 1 dòng NAK-001 ¥11,800; SBK-018, NAK-007 không có dòng', 'pgTAP: gọi trước hạn → ERR_BEFORE_DUE; ADM gọi → ERR_FORBIDDEN', 'pgTAP: tính lại sau khi duyệt NAK-001 → amount NAK-001 không đổi', 'pgTAP: kỳ không ai đạt → `incentives_calculated_at` vẫn được set'],
});
L('T-10-03-b', 'I-10-03', 'rpc', 'approve_incentives / reject_incentives (ADM, decision_note)', {
  role: 'BE-2', ph: 5, c: '完納奨励金', dep: ['T-10-03-a'],
  g: 'Người duyệt khác người tính; từ chối phải có lý do.',
  s: 'SC-32 Implementation Mapping E18/E19/E22; BR-27; BR-43; D-02; PERM-07',
  sc: ['`approve_incentives(p_ids)`: chỉ ADM; `calculated → approved`; ghi decided_by/at', '`reject_incentives(p_ids, p_reason)`: lý do ≥ 5 ký tự → `rejected` + decision_note', 'Audit với reason; batch nguyên tử (một dòng sai trạng thái → cả lô lỗi)'],
  dod: ['pgTAP: W-ACC/W-MGR gọi → ERR_FORBIDDEN', 'pgTAP: duyệt dòng đã approved → ERR_INVALID_STATE, không dòng nào đổi', 'pgTAP: reject thiếu lý do → ERR_REASON_REQUIRED; kỳ locked → ERR_PERIOD_LOCKED'],
});
I('I-10-04', 'E10', 'Khấu trừ thưởng vào hóa đơn kỳ sau và chuyển tiếp phần dư', {
  c: '完納奨励金',
  g: 'Thưởng đã duyệt trừ vào hóa đơn kỳ sau, không vượt tiền hàng chưa thuế, phần dư chuyển tiếp; đồng bộ khi void/phát hành lại.',
  s: 'BR-24, BR-27, D-11, D-12, GAP-13, GAP-22, SC-28 E11/E12, SC-27 Data Flow, Q19',
  dod: ['Tổng hóa đơn ≥ tiền thuế ≥ 0', 'Σ applications = amount ⇔ status `applied`'],
});
L('T-10-04-a', 'I-10-04', 'rpc', 'fn_apply_incentives trong close_period: cap ≤ tiền hàng, FIFO, chuyển tiếp phần dư', {
  role: 'BE-1', ph: 5, c: '完納奨励金', dep: ['T-10-03-b', 'T-09-02-b'],
  g: 'Ghi `incentive_applications` khi chốt kỳ sau (BR-24, D-11, D-12).',
  s: 'BR-24; BR-27; D-11; D-12; GAP-13; GAP-22; SC-28 Implementation Mapping E11/E12; SC-27 Data Flow; Q19',
  sc: ['Với mỗi hóa đơn mới: remaining = Σ (amount − Σ applied) của thưởng completion `approved` của bên mua, FIFO theo kỳ cũ nhất', 'deduction = min(remaining, goods_amount); thuế tính trên goods **trước** khấu trừ (D-12)', 'Ghi từng dòng application; thưởng đủ → `applied`; còn dư giữ `approved`', '`preview_close_period` hiển thị cùng số khấu trừ'],
  dod: ['pgTAP: thưởng ¥11,800, tiền hàng kỳ sau ¥1,240,000 → trừ ¥11,800, `applied` (ví dụ SC-28)', 'pgTAP: thưởng ¥15,800, tiền hàng ¥11,800 → trừ ¥11,800, dư ¥4,000 giữ `approved`; kỳ kế tiếp trừ ¥4,000 → `applied`', 'pgTAP: bên mua không có hóa đơn kỳ sau → thưởng giữ `approved`, không lỗi', 'pgTAP: hai thưởng từ 2 kỳ → trừ kỳ cũ trước; total ≥ tax_amount'],
});
L('T-10-04-b', 'I-10-04', 'rpc', 'Đồng bộ thưởng khi void/phát hành lại hóa đơn và khi hủy 消込', {
  role: 'BE-2', ph: 5, c: '完納奨励金', dep: ['T-10-04-a', 'T-09-03-a'],
  g: 'Thưởng không bị mất hoặc trừ hai lần khi chứng từ thay đổi.',
  s: 'SC-28 Implementation Mapping E21 ("gắn lại thưởng"); SC-29 E20 (ERR_INCENTIVE_DEPENDS); BR-23; BR-27; D-11',
  sc: ['`void_and_reissue_invoice` của hóa đơn có khấu trừ: chuyển application sang hóa đơn mới với cùng số (cap lại theo goods mới, phần dư trả về `approved`)', 'Void hóa đơn kỳ N của bên mua đã có thưởng approved → ERR_INCENTIVE_DEPENDS (đề xuất, ghi trong backlog-coverage § c)', '`check_period_lock` trả INCENTIVE_* đúng'],
  dod: ['pgTAP: void hóa đơn kỳ 10 có khấu trừ ¥11,800 → hóa đơn mới vẫn khấu trừ ¥11,800, Σ applications không đổi', 'pgTAP: goods hóa đơn mới < khấu trừ cũ → cap, phần dư quay về approved', 'pgTAP: unallocate 消込 kỳ 9 khi thưởng approved → ERR_INCENTIVE_DEPENDS'],
});
I('I-10-05', 'E10', 'SC-32 giao diện, 完納率 KPI và hồi quy 2 kỳ', {
  c: '完納奨励金',
  g: 'Kế toán/ADM thấy bảng đối chiếu và duyệt; bên mua thấy thưởng của mình; báo cáo có 完納率; luồng 2 kỳ được khóa bằng E2E.',
  s: 'SC-32, SC-28 E11/E12, SC-35 E07, SC-03 E21, US-14, FT-33',
  dod: ['Câu hỏi "vì sao tôi không được thưởng" trả lời được từ màn hình (US-14 tc3)', 'E2E 2 kỳ xanh'],
});
L('T-10-05-a', 'I-10-05', 'fe', 'SC-32 bảng đối chiếu + thẻ tổng hợp + panel bằng chứng + nút 計算実行', {
  role: 'FE-1', ph: 5, c: '完納奨励金', dep: ['T-10-03-a', 'T-01-03-a'],
  g: 'Bảng đối chiếu mọi bên mua (cả người không đạt) kèm bằng chứng.',
  s: 'SC-32 § 2–§ 7 (R2–R5, E01–E16, E20); SC-32 Component Variants',
  sc: ['Chọn kỳ (mặc định kỳ gần nhất đã qua hạn), E03 phiên bản + bậc', 'IncentiveEvidenceTable cột E06–E15; ○/× kèm chữ (a11y)', 'Panel R5: hóa đơn + tiền về, link SC-28/SC-29', 'E04 chỉ W-ACC/W-MGR; disabled trước hạn với tooltip `支払期限（10/15）経過後に計算できます`'],
  dod: ['E2E: trước hạn E04 disabled; sau hạn bấm → toast số người đạt và tổng', 'Bảng hiện 3 dòng ví dụ với đúng nhãn ○ 完納 / × 期限後入金 / × 一部入金'],
});
L('T-10-05-b', 'I-10-05', 'fe', 'SC-32 thanh duyệt ADM + hộp thoại 却下 + chế độ bên mua + hiển thị khấu trừ ở SC-28', {
  role: 'FE-2', ph: 5, c: '完納奨励金', dep: ['T-10-05-a', 'T-10-03-b', 'T-10-04-a', 'T-09-03-b'],
  g: 'ADM duyệt/từ chối hàng loạt; bên mua và kế toán thấy thưởng đã trừ ở đâu.',
  s: 'SC-32 E16–E19, E22, R6; SC-28 E11/E12; PERM-07; PERM-09',
  sc: ['Checkbox chọn dòng `calculated`, Shift+click chọn dải; 承認（n件）; 却下 + lý do (bẫy focus)', 'Bên mua: chỉ dòng của mình từ 承認済; ẩn E02/E04/E05', 'E16 từ `incentive_applications`: `INV-… で控除` / `次回請求で控除予定`; SC-28 E11 `−¥11,800（2026年9月分）`, E12 `¥4,000 を次期に繰越`'],
  dod: ['E2E: ADM duyệt 3 dòng → toast `3件を承認しました`', 'E2E: W-ACC không thấy thanh duyệt; SBK chỉ thấy dòng của mình'],
});
L('T-10-05-c', 'I-10-05', 'rpc', '完納率 KPI: report_monthly + dữ liệu tiến độ 完納 cho SC-03', {
  role: 'BE-2', ph: 6, c: '完納奨励金', dep: ['T-10-02-a', 'T-12-02-a'],
  g: 'Báo cáo tháng và dashboard dùng cùng định nghĩa 完納 với SC-32.',
  s: 'SC-35 E07 Implementation Mapping; SC-03 E21; BR-27; I-00-02 (đơn vị đếm)',
  sc: ['`report_monthly` thêm 完納率 = số bên mua đạt / số bên mua có hóa đơn, cho kỳ có `period_end` trong tháng, gọi `fn_is_kannou` (không viết lại công thức per-invoice như SC-35 đang ghi)', 'Cảnh báo `支払期限前` khi kỳ chưa qua hạn', 'Truy vấn tiến độ cho bên mua (SC-03 E21): tổng HĐ, đã trả, hạn, còn n ngày, thưởng approved/applied'],
  dod: ['pgTAP: 完納率 với 3 bên mua ví dụ = 1/3', 'pgTAP: kỳ chưa qua hạn → cờ `支払期限前`'],
});
L('T-10-05-d', 'I-10-05', 'fe', 'Widget 完納率 (SC-35 E07) và 完納奨励金の進捗 (SC-03 E21)', {
  role: 'FE-2', ph: 6, c: '完納奨励金', dep: ['T-10-05-c', 'T-12-02-b', 'T-12-03-b'],
  g: 'Hiển thị KPI 完納 cho văn phòng và tiến độ cho bên mua.',
  s: 'SC-35 E07; SC-03 E21; screen-flow (SC-03 → SC-32)',
  sc: ['SC-35 tab 月報: `n / n（%）` + cảnh báo trước hạn', 'SC-03 vùng R7: progress bar `¥ / ¥`, `あと n 日`, link SC-32'],
  dod: ['E2E: NAK thấy tiến độ của mình, không thấy của người khác', 'Số trên widget = số trên SC-32'],
});
L('T-10-05-e', 'I-10-05', 'test', 'E2E hồi quy 完納奨励金 trọn 2 kỳ (tính → duyệt → khấu trừ → chuyển tiếp → void → khóa)', {
  role: 'QA', ph: 6, c: '完納奨励金', dep: ['T-10-05-b', 'T-10-04-b', 'T-09-01-c', 'T-10-05-d'],
  g: 'Chứng minh toàn bộ chuỗi biến của 完納奨励金 đúng qua 2 kỳ liên tiếp.',
  s: 'architecture § 3.4; SC-32 Happy Path; SC-28 ví dụ; BR-24; BR-27; BR-29; D-09; US-14',
  sc: ['Kỳ 9: 3 bên mua (đúng hạn / trễ 10/17 / thiếu) → 消込 → 10/16 tính → ADM duyệt NAK-001, từ chối một dòng có lý do', 'Kỳ 10: chốt → khấu trừ ¥11,800 (applied); bên mua có thưởng > tiền hàng → chuyển tiếp ¥4,000', 'Void + phát hành lại hóa đơn kỳ 10 → khấu trừ giữ nguyên; khóa kỳ 9 rồi 10; 消込 tiền trễ vào kỳ 9 đã khóa vẫn được (D-09) nhưng thưởng không đổi'],
  dod: ['E2E xanh trên CI với fixture riêng (seed kỳ 9/10)', 'Số liệu khớp ví dụ SC-32/SC-28 đến từng yên'],
});

// ───────────── E11 仕切書 & 出荷奨励金 ─────────────
E('E11', 'E11 Quyết toán chủ hàng 仕切書 & 出荷奨励金', {
  pr: 'Must', c: '業務規程 có phiên bản',
  scope: ['SC-31 lập / phát hành / hủy 仕切書 cho 委託 và 買付', '出荷奨励金 (BR-33, Should, mặc định tắt) — tính và áp vào 仕切書 kỳ sau'],
  s: 'SC-31, SC-32, BR-30, BR-31, BR-32, BR-33, GAP-11, GAP-19, D-10, D-13, A-03, A-07, FT-32, FT-34, Q38',
  notes: ['委託手数料 chỉ trừ ở 仕切書 (A-03) — gỡ GAP-11 hai phía trong cùng release', 'BR-32 chỉ áp cho 委託; 買付 trả đủ giá mua × SL (D-10)'],
});
I('I-11-01', 'E11', 'SC-31 Lập và phát hành 仕切書', {
  g: 'Kế toán lập 仕切書 theo kỳ cho từng 荷主, trừ 手数料 và chi phí, phát hành bất biến.',
  s: 'SC-31, FT-32, FT-38, BR-30, BR-31, BR-32, GAP-11, GAP-19, D-10, D-13, US-13',
  dod: ['Ví dụ ¥686,175 khớp', '仕切書 đã phát hành không sửa được'],
});
L('T-11-01-a', 'I-11-01', 'db', 'Migration settlements / settlement_lines / settlement_costs + số 仕切書 + khóa kỳ', {
  role: 'BE-1', ph: 5, dep: ['T-04-03-a', 'T-05-01-a', 'T-09-01-a'],
  g: 'Schema quyết toán chủ hàng (sửa GAP-19, D-13).',
  s: 'SC-31 Ghi chú LAB-5 DB; D-13; GAP-19; BR-32',
  sc: ['`settlements` (+issued_at, void_reason, replaced_by, paid_on, arrival_id, rule_set_id), `settlement_lines`, `settlement_costs`', '`settlement_no_seq`; gắn `trg_block_locked_period` và `fn_audit`; RLS (chỉ W-ACC/W-MGR/ADM)'],
  dod: ['pgTAP: kỳ locked → sửa settlement → ERR_PERIOD_LOCKED', 'pgTAP: KAI/NAK không đọc được'],
});
L('T-11-01-b', 'I-11-01', 'rpc', 'draft_settlement (委託 / 買付 / lô bán dở) + update_settlement_costs + pgTAP ¥686,175', {
  role: 'BE-1', ph: 5, c: '業務規程 có phiên bản', dep: ['T-11-01-a', 'T-06-02-b', 'T-07-02-a'],
  g: 'Tính tiền trả chủ hàng theo BR-30/BR-31/BR-32 (chuyển 手数料 sang đây — GAP-11).',
  s: 'SC-31 Ghi chú LAB-5 RPC; BR-30; BR-31; BR-32; D-10; GAP-11; A-03; A-07; Q18',
  sc: ['委託: Σ 成立 − `commission_rate_consignment` × Σ − chi phí (lý do bắt buộc); chỉ phần đã bán', '買付: `purchase_unit_price` × SL nhập, không phụ thuộc đã bán', 'Phiên bản 業務規程 tại ngày lập; thuế theo I-00-01'],
  dod: ['pgTAP ví dụ ¥686,175 (委託 + 買付 + lô bán dở)', 'pgTAP: chi phí thiếu lý do → ERR_REASON_REQUIRED; số âm → ERR_NEGATIVE_PAYABLE'],
});
L('T-11-01-c', 'I-11-01', 'rpc', 'issue_settlement / void_settlement (bất biến, kiểm 振込先)', {
  role: 'BE-2', ph: 5, dep: ['T-11-01-b'],
  g: 'Phát hành và hủy 仕切書 giống quy tắc 請求書.',
  s: 'SC-31 Implementation Mapping; BR-32; BR-23 (tương tự); D-13',
  sc: ['`issue_settlement`: 荷主 thiếu tài khoản → ERR_SHIPPER_NO_BANK', '`void_settlement` có lý do, `replaced_by`', 'Kỳ locked → ERR_PERIOD_LOCKED'],
  dod: ['pgTAP: phát hành 2 lần → ERR_INVALID_STATE', 'pgTAP: sửa dòng sau phát hành → lỗi'],
});
L('T-11-01-d', 'I-11-01', 'infra', 'PDF 仕切書 dùng module ADR-011', {
  role: 'FE-2', ph: 5, dep: ['T-11-01-c', 'T-01-04-a'],
  g: 'Chứng từ 仕切書 gửi chủ hàng.',
  s: 'SC-31 Ghi chú LAB-5 (PDF 仕切書); ADR-011; Q10; Q18',
  sc: ['Template: 荷主, kỳ, từng lô (bán / còn lại), 手数料, chi phí, thuế, tiền trả, phiên bản 業務規程'],
  dod: ['Snapshot test với ví dụ ¥686,175', 'Dòng thuế theo thuế suất hiển thị đúng quyết định Q18 (I-00-01)'],
});
L('T-11-01-e', 'I-11-01', 'fe', 'SC-31 danh sách + chi tiết + nhập chi phí + phát hành / hủy', {
  role: 'FE-1', ph: 5, dep: ['T-11-01-c'],
  g: 'Màn 仕切 cho kế toán.',
  s: 'SC-31 § 3–§ 7',
  sc: ['Danh sách theo kỳ/荷主; chi tiết dòng lô (phần còn lại của 委託 hiển thị riêng)', 'Editor chi phí có lý do; nút phát hành / hủy'],
  dod: ['E2E: lập → thêm chi phí → phát hành → PDF', 'W-FLR không truy cập được (404)'],
});
I('I-11-02', 'E11', '出荷奨励金 cho chủ hàng (mặc định tắt)', {
  pr: 'Should',
  g: 'Khi 業務規程 có bậc `shipping_incentive_tiers`, tính và duyệt 出荷奨励金 như BR-27, áp vào 仕切書 kỳ sau.',
  s: 'BR-33, FT-34, SC-32 tab 出荷, D-11, Q38',
  dod: ['Bậc rỗng → tab 無効, không tính được', 'Không ảnh hưởng 完納奨励金'],
});
L('T-11-02-a', 'I-11-02', 'rpc', 'calculate_incentives(kind=shipping) + ERR_TIERS_EMPTY + pgTAP', {
  role: 'BE-2', ph: 5, pr: 'Should', c: '業務規程 có phiên bản', dep: ['T-10-03-a', 'T-11-01-b'],
  g: 'Mở rộng RPC tính cho chủ hàng.',
  s: 'SC-32 Implementation Mapping (E04 shipping); BR-33; FT-34',
  sc: ['Base = doanh số của 荷主 trong kỳ (委託 hoặc cả 買付 theo I-00-06)', 'Rate từ `shipping_incentive_tiers` của phiên bản tại ngày chốt; unique theo shipper', 'Duyệt dùng chung `approve_incentives`/`reject_incentives`'],
  dod: ['pgTAP: tiers `[]` → ERR_TIERS_EMPTY', 'pgTAP: tính shipping không đụng dòng completion'],
});
L('T-11-02-b', 'I-11-02', 'rpc', 'Áp 出荷奨励金 vào 仕切書 kỳ sau qua incentive_applications.settlement_id', {
  role: 'BE-1', ph: 5, pr: 'Should', dep: ['T-11-02-a', 'I-00-06'],
  g: 'Trả thưởng cho chủ hàng theo kênh khách xác nhận.',
  s: 'SC-32 Implementation Mapping (出荷 áp dụng); D-11; BR-33',
  sc: ['`draft_settlement` cộng thưởng approved vào 仕切書 kỳ sau, ghi application `settlement_id`', 'Nếu khách chọn trả riêng → chỉ đánh dấu `applied` khi ghi nhận chi trả'],
  dod: ['pgTAP: thưởng 出荷 approved → 仕切書 kỳ sau có dòng cộng; status applied'],
});
L('T-11-02-c', 'I-11-02', 'fe', 'SC-32 tab 出荷奨励金 (trạng thái 無効, cột không có 完納)', {
  role: 'FE-1', ph: 5, pr: 'Should', dep: ['T-11-02-a', 'T-10-05-b'],
  g: 'Hiển thị tab 出荷 theo biến thể bảng `shipping`.',
  s: 'SC-32 E02, E21; SC-32 Component Variants',
  sc: ['Tab 出荷: cột 荷主, base, rate, amount, trạng thái; không có cột E07–E11', 'Bậc rỗng → E21 `…（無効）`, ẩn E04/E17–E19'],
  dod: ['E2E: tiers rỗng → tab mờ có nhãn 無効'],
});

// ───────────── E12 公表, báo cáo, dashboard ─────────────
E('E12', 'E12 Công bố 公表, báo cáo & dashboard', {
  c: '公表 theo 卸売市場法',
  scope: ['公表: bản chụp số liệu theo ngày, trang công khai không đăng nhập (SC-34) + panel công bố (SC-35)', 'Nhật báo / nguyệt báo + xuất CSV/PDF (SC-35)', 'Dashboard theo vai trò (SC-03, Should)'],
  s: 'SC-03, SC-34, SC-35, BR-50, BR-51, BR-52, GAP-16, GAP-20, D-01, D-15, D-16, FT-36, FT-37, FT-38, FT-39, Q35, Q40',
  notes: ['Bản công bố là ảnh chụp, không tính lại khi giao dịch bị sửa (BR-50, 卸売市場法)', 'Chỉ W-MGR bấm 公表 / 取り下げ (D-01)', 'anon chỉ đọc view `public_publications` (D-16)'],
});
I('I-12-01', 'E12', 'Công bố kết quả giao dịch 公表 (SC-34 + panel SC-35)', {
  c: '公表 theo 卸売市場法',
  g: 'W-MGR tạo bản xem trước, công bố bản chụp; công chúng xem không cần đăng nhập.',
  s: 'SC-34, SC-35, BR-50, BR-51, BR-52, GAP-20, D-01, D-15, D-16, FT-36, US-15',
  dod: ['Sửa giao dịch sau công bố → trang công khai không đổi', 'anon không đọc được bảng gốc'],
});
L('T-12-01-a', 'I-12-01', 'db', 'publications / publication_rows + view public_publications (không security_invoker) + grant anon', {
  role: 'BE-1', ph: 6, c: '公表 theo 卸売市場法', dep: ['T-06-01-a', 'T-04-02-a'],
  g: 'Lưu bản chụp công bố và mở đúng một cửa cho anon (sửa GAP-20).',
  s: 'SC-34 Ghi chú LAB-5 DB; ADR-011; D-15; D-16; BR-50; BR-51; BR-52; GAP-20',
  sc: ['`publications` (+revision, partial unique `WHERE status=\'published\'`, withdrawn_*)', '`publication_rows` (+species_name_ja; price_high/low/avg cùng NULL với loại ẩn giá)', 'View `public_publications` owner là role hạn chế, không security_invoker; GRANT SELECT view cho anon'],
  dod: ['pgTAP: anon select `transactions`, `publications`, `publication_rows` → lỗi quyền', 'pgTAP: bản draft/withdrawn không có trong view; loại ẩn có cả 3 giá NULL'],
});
L('T-12-01-b', 'I-12-01', 'rpc', 'build_publication / publish (preview_hash) / withdraw_publication + pgTAP', {
  role: 'BE-2', ph: 6, c: '公表 theo 卸売市場法', dep: ['T-12-01-a'],
  g: 'Công bố đúng số đã xem trước; chặn khi dữ liệu đổi giữa chừng.',
  s: 'SC-35 Ghi chú LAB-5 DB/RPC; BR-50; BR-51; D-01; X-9',
  sc: ['`build_publication(date)`: gộp せり + 相対 theo 品目, giá cao/thấp/bình quân gia quyền, ẩn giá theo `publication_hidden_species`', '`publish(p_pub_id, p_preview_hash)`: hash khác → ERR_PUB_STALE (RPC chưa có trong index)', '`withdraw_publication` có lý do; công bố lại tăng revision'],
  dod: ['pgTAP: W-ACC gọi publish → ERR_FORBIDDEN', 'pgTAP: sửa giao dịch giữa build và publish → ERR_PUB_STALE', 'pgTAP: 休市日 → ERR_PUB_HOLIDAY; không có dữ liệu → ERR_PUB_NO_DATA'],
});
L('T-12-01-c', 'I-12-01', 'fe', 'SC-34 trang công khai /public/results (PC bảng, mobile thẻ, in) + revalidateTag', {
  role: 'FE-1', ph: 6, c: '公表 theo 卸売市場法', dep: ['T-12-01-b'],
  g: 'Trang công bố không cần đăng nhập (LAB-2 đang bắt đăng nhập).',
  s: 'SC-34 § 3–§ 7; SC-34 Ghi chú LAB-5 FE/Cache; Q35',
  sc: ['Route `app/public/results/[[...date]]` ngoài `(app)`', 'Bảng PC + thẻ mobile + CSS in; ngày bị rút → "データなし"', 'Cache theo tag, `revalidateTag` khi publish/withdraw'],
  dod: ['Lighthouse mobile ≥ 90 performance', 'Không có request nào tới bảng gốc (kiểm network)'],
});
L('T-12-01-d', 'I-12-01', 'fe', 'SC-35 panel 公表: xem trước, công bố, rút, lịch sử', {
  role: 'FE-2', ph: 6, c: '公表 theo 卸売市場法', dep: ['T-12-01-b', 'T-12-02-b'],
  g: 'W-MGR công bố từ màn báo cáo ngày.',
  s: 'SC-35 § 3 (E18–E22), § 4; D-01',
  sc: ['Panel xem trước số liệu sẽ công bố + hash', 'Nút 公表する / 取り下げ (lý do) chỉ W-MGR', 'Lịch sử revision'],
  dod: ['W-ACC/ADM không thấy nút'],
});
L('T-12-01-e', 'I-12-01', 'test', 'E2E 公表: xem không đăng nhập; sửa giao dịch sau công bố → số không đổi (GAP-20)', {
  role: 'QA', ph: 6, c: '公表 theo 卸売市場法', dep: ['T-12-01-c', 'T-12-01-d', 'T-06-03-c'],
  g: 'Hồi quy GAP-20 và BR-52.',
  s: 'SC-34 Ghi chú LAB-5 Test (E2E); GAP-20; BR-50; BR-52',
  sc: ['Mở trang khi chưa đăng nhập', 'Công bố → sửa giá một giao dịch (duyệt sửa) → trang công khai giữ số cũ', 'Rút công bố → "データなし"'],
  dod: ['E2E xanh'],
});
I('I-12-02', 'E12', 'SC-35 Nhật báo / nguyệt báo và xuất chứng từ', {
  g: 'Văn phòng xem 取扱高 theo ngày/tháng và xuất CSV kế toán, PDF lưu trữ.',
  s: 'SC-35, FT-37, FT-38, Q40, architecture § 5 I-2',
  dod: ['CSV mở đúng trong phần mềm kế toán khách', 'Không có CSV injection'],
});
L('T-12-02-a', 'I-12-02', 'rpc', 'report_daily / report_monthly (theo kênh, 品目, bên mua)', {
  role: 'BE-1', ph: 6, dep: ['T-09-02-b', 'T-07-02-a'],
  g: 'Số liệu báo cáo tính ở DB, kiểm quyền theo vai trò.',
  s: 'SC-35 Implementation Mapping; SC-35 Ghi chú LAB-5 DB/RPC',
  sc: ['`report_daily(date)`, `report_monthly(month)`: tổng SL/tiền theo kênh, 品目, bên mua', 'Chỉ W-ACC/W-MGR/ADM'],
  dod: ['pgTAP: số ngày khớp tổng `transactions` concluded của ngày', 'pgTAP: NAK gọi → ERR_FORBIDDEN'],
});
L('T-12-02-b', 'I-12-02', 'fe', 'SC-35 trang /reports hai tab + xuất CSV (chống injection, UTF-8 BOM) + PDF báo cáo', {
  role: 'FE-1', ph: 6, dep: ['T-12-02-a', 'T-01-04-a', 'I-00-07'],
  g: 'Màn báo cáo và Route Handler xuất file.',
  s: 'SC-35 § 3–§ 7; SC-35 Implementation Mapping E21/E22; Q40',
  sc: ['Tab 日報 / 月報 + bộ chọn ngày/tháng; bảng theo 品目, bên mua', '`GET /reports/accounting-csv?kind=invoices|payments|settlements&period_id=`; escape `= + - @`', 'PDF báo cáo qua module chung'],
  dod: ['Vitest: CSV escape ô bắt đầu bằng `=`', 'CSV mở trong Excel JP không lỗi font (BOM)'],
});
I('I-12-03', 'E12', 'SC-03 Dashboard theo vai trò', {
  pr: 'Should',
  g: 'Mỗi người thấy việc cần làm hôm nay của mình; không lộ dữ liệu bên mua khác.',
  s: 'SC-03, FT-39, GAP-16, PERM-09',
  dod: ['4 vai trò thấy đúng tập vùng', 'NAK-A không thấy số của NAK-B'],
});
L('T-12-03-a', 'I-12-03', 'rpc', 'rpc_dashboard_kpi / rpc_dashboard_approvals + kiểm "chỉ chính mình" ở fn_buyer_exposure', {
  role: 'BE-2', ph: 6, pr: 'Should', dep: ['T-06-01-b', 'T-10-01-a', 'T-03-01-a'],
  g: 'Số liệu dashboard tính ở DB, đúng vai trò (hồi quy GAP-16).',
  s: 'SC-03 Ghi chú LAB-5 DB/RPC + Test pgTAP; SC-03 Implementation Mapping E08–E09; GAP-16',
  sc: ['`rpc_dashboard_kpi` (nhân viên), `rpc_dashboard_approvals` (ADM: hồ sơ, sửa, ngoại lệ, thưởng `calculated`, 業務規程 draft)', '`fn_buyer_exposure` chỉ trả cho chính mình với bên mua'],
  dod: ['pgTAP: NAK-A không thấy giao dịch/hóa đơn NAK-B; W-FLR không đọc `invoices`; KAI gọi kpi → ERR_FORBIDDEN'],
});
L('T-12-03-b', 'I-12-03', 'fe', 'resolveDashboardRegions + 10 vùng (Suspense / error boundary riêng)', {
  role: 'FE-1', ph: 6, pr: 'Should', dep: ['T-12-03-a', 'T-01-03-a'],
  g: 'Dashboard ghép vùng theo vai trò.',
  s: 'SC-03 § 2–§ 7; SC-03 Ghi chú LAB-5 FE',
  sc: ['Hàm `resolveDashboardRegions(kind, functions)` theo ma trận SC-03 § 7', '10 component vùng, mỗi vùng Suspense + error boundary', 'Link sang màn hình duyệt (SC-07, SC-18, SC-32, SC-11)'],
  dod: ['Vitest: ma trận vùng cho 10 vai trò', 'Một vùng lỗi không làm hỏng vùng khác'],
});
L('T-12-03-c', 'I-12-03', 'test', 'E2E dashboard 4 vai trò (ADM / W-FLR / NAK / KAI)', {
  role: 'QA', ph: 6, pr: 'Should', dep: ['T-12-03-b', 'T-10-05-d'],
  g: 'Khóa nội dung dashboard theo vai trò.',
  s: 'SC-03 Ghi chú LAB-5 Test (E2E); SC-03 § 7',
  sc: ['Đăng nhập lần lượt 4 vai trò, kiểm tập vùng', 'NAK thấy 完納 tiến độ của mình'],
  dod: ['E2E xanh'],
});

// ───────────── E13 Quản trị ─────────────
E('E13', 'E13 Quản trị: audit log, cài đặt, thông báo', {
  scope: ['SC-36 audit log (gắn `fn_audit` cho mọi bảng nhóm A–F)', 'SC-37 mẫu email, lịch sử gửi, display token, chính sách sao lưu'],
  s: 'SC-36, SC-37, ADR-008, BR-43, D-17, D-18, D-28, FT-40, FT-41, FT-42, Q41',
  notes: ['audit_logs chỉ thêm, không ai sửa/xóa (BR-43)'],
});
I('I-13-01', 'E13', 'SC-36 Audit log', {
  g: 'Tra cứu ai đổi gì, khi nào, trước/sau, lý do trên mọi bảng nghiệp vụ.',
  s: 'SC-36, FT-40, ADR-008, BR-43, D-18, Q41',
  dod: ['Mọi bảng nhóm A–F có trigger audit (trừ audit_logs, notifications)', 'Không role nào sửa/xóa được audit'],
});
L('T-13-01-a', 'I-13-01', 'db', 'Gắn fn_audit cho mọi bảng nhóm A–F + kiểm audit_reason trong RPC + index + RLS audit_logs', {
  role: 'BE-1', ph: 6, dep: ['T-01-02-c', 'T-11-01-a', 'T-10-01-a', 'T-12-01-a', 'T-08-01-a'],
  g: 'Đủ phạm vi BR-43 (D-18).',
  s: 'SC-36 Ghi chú LAB-5 DB; ADR-008; BR-43; D-18; BR-12; BR-20; BR-29; BR-42; Q41',
  sc: ['Script kiểm: mọi bảng schema nghiệp vụ có trigger `fn_audit`', 'RPC bắt buộc lý do (BR-12, BR-20, BR-29, BR-42) đều set `app.audit_reason`', 'Index (table, row_id), (actor, at); RLS: ADM tất cả, W-MGR bảng nghiệp vụ 卸売業者 (Q41)'],
  dod: ['pgTAP: sửa giá giao dịch qua RPC → 1 dòng có before/after/reason', 'pgTAP: W-MGR không đọc dòng `participants`', 'Script kiểm bảng thiếu trigger chạy trong CI'],
});
L('T-13-01-b', 'I-13-01', 'fe', 'SC-36 trang lọc + bảng keyset + ngăn kéo diff + từ điển nhãn cột tiếng Nhật', {
  role: 'FE-2', ph: 6, dep: ['T-13-01-a'],
  g: 'Màn tra cứu audit log.',
  s: 'SC-36 § 3–§ 7',
  sc: ['Bộ lọc bảng / người / khoảng thời gian / row_id qua URL', 'Phân trang keyset; ngăn kéo diff before/after', 'Từ điển nhãn cột JP'],
  dod: ['Trang 10k dòng tải < 1 giây (staging)'],
});
I('I-13-02', 'E13', 'SC-37 Cài đặt thông báo và hệ thống', {
  pr: 'Should',
  g: 'ADM sửa mẫu email, xem lịch sử gửi, thu hồi display token, xem chính sách sao lưu.',
  s: 'SC-37, FT-41, FT-42, D-17, D-28',
  dod: ['Chỉ ADM', 'Mẫu email escape biến'],
});
L('T-13-02-a', 'I-13-02', 'rpc', 'update_notification_template / enqueue_test_notification / requeue_notification / revoke_display_token', {
  role: 'BE-2', ph: 6, pr: 'Should', dep: ['T-01-04-b'],
  g: 'Cấu hình thông báo qua RPC có kiểm quyền.',
  s: 'SC-37 Ghi chú LAB-5 DB/BE + Test; D-17',
  sc: ['4 RPC; validate biến template (ERR_TEMPLATE_VARIABLE)', '`requeue_notification` chỉ dòng lỗi (ERR_NOT_RETRYABLE)', '`revoke_display_token` (nếu SC-24 làm)'],
  dod: ['pgTAP: vai trò khác ADM → ERR_FORBIDDEN', 'pgTAP: requeue dòng `sent` → ERR_NOT_RETRYABLE'],
});
L('T-13-02-b', 'I-13-02', 'fe', 'SC-37 trang 5 tab: mẫu email (chèn biến), lịch sử gửi, token, sao lưu', {
  role: 'FE-1', ph: 6, pr: 'Should', dep: ['T-13-02-a', 'I-00-07'],
  g: 'Màn cài đặt cho ADM.',
  s: 'SC-37 § 3–§ 7; D-28',
  sc: ['Editor mẫu có chèn biến + xem trước', 'Bảng lịch sử gửi + nút gửi lại', 'Bảng display token; tab sao lưu chỉ hiển thị chính sách (không gọi Management API)'],
  dod: ['E2E: sửa mẫu → gửi thử → nhận trên Inbucket'],
});
