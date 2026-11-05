import { E, I, L } from './lib.mjs';

// ───────────── E05 Nhập hàng, 目利き, phân bổ ─────────────
E('E05', 'E05 Nhập hàng, thẩm định 目利き, phân bổ kênh', {
  c: 'HITL 目利き/符丁',
  scope: ['SC-14 đăng ký lô (tablet, mạng yếu), SC-15 thẩm định + 符丁 có ảnh, SC-16 phân bổ kênh tách lô, SC-13 danh sách lô + nhãn'],
  s: 'SC-13, SC-14, SC-15, SC-16, ADR-006, ADR-007, ADR-010, BR-10…BR-15, BR-40, BR-41, GAP-04, GAP-05, GAP-06, GAP-07, D-19, D-25',
  notes: ['Không có gợi ý tự động hạng tươi / OCR 符丁 — người thẩm định quyết định (ADR-007)', 'Kéo-thả chỉ PC, tablet dùng nút (PREMISE § 3)'],
});
I('I-05-01', 'E05', 'SC-14 Đăng ký lô nhập trên tablet', {
  g: 'Nhân viên sàn nhập lô < 30 giây/lô, không trùng mã khi nhiều người nhập cùng lúc, không mất dữ liệu khi rớt mạng.',
  s: 'SC-14, FT-10, BR-10, BR-40, BR-41, GAP-05, GAP-17, ADR-010, D-19',
  dod: ['Hai phiên đồng thời không sinh trùng mã lô', 'Gửi lại cùng `client_request_id` trả cùng `lot_no`'],
});
L('T-05-01-a', 'I-05-01', 'db', 'Migration arrivals / lots TO-BE + bộ đếm fn_next_lot_no + trigger 休市日', {
  role: 'BE-1', ph: 3, dep: ['T-04-03-a', 'T-04-02-a', 'T-04-01-a'],
  g: 'Mã lô sinh bằng bộ đếm có khóa hàng (sửa GAP-05), ngày nghiệp vụ JST (GAP-17).',
  s: 'SC-14 Ghi chú LAB-5 [DB] + [DB_GAP] #1–#3; BR-10; BR-40; GAP-05; GAP-17; D-19',
  sc: ['`arrivals` (+shipper_id, business_date, trade_form, client_request_id, note)', '`lots` TO-BE (+client_request_id UNIQUE, purchase_unit_price, bỏ cột thẩm định cũ)', 'Bảng bộ đếm (business_date, vessel) + `fn_next_lot_no` dạng `YYMMDD-<tàu>-NNN`', 'Trigger `fn_assert_market_open`; gắn `fn_audit`'],
  dod: ['pgTAP: 2 transaction song song cùng tàu/ngày → 2 số liên tiếp, không lỗi unique', 'pgTAP: insert lô ngày 休市日 → ERR_MARKET_CLOSED'],
});
L('T-05-01-b', 'I-05-01', 'rpc', 'register_arrival (idempotent) + pgTAP', {
  role: 'BE-2', ph: 3, dep: ['T-05-01-a'],
  g: 'Một RPC ghi chuyến nhập + nhiều lô, an toàn khi gửi lại.',
  s: 'SC-14 Implementation Mapping; ADR-010; BR-31 (giá mua 買付); A-07',
  sc: ['Kiểm W-FLR/W-MGR; `business_date` do server gán', '買付 bắt buộc `purchase_unit_price`', 'Cùng `client_request_id` → trả kết quả cũ'],
  dod: ['pgTAP: 休市日 → ERR_MARKET_CLOSED; 買付 thiếu giá → ERR_PURCHASE_PRICE_REQUIRED', 'pgTAP: gọi lại cùng id → cùng `lot_no`, không thêm dòng', 'pgTAP: NAK gọi → ERR_FORBIDDEN'],
});
L('T-05-01-c', 'I-05-01', 'fe', 'SC-14 form tablet: lưới nút, bàn phím số, giữ nháp', {
  role: 'FE-2', ph: 3, dep: ['T-05-01-b', 'T-01-03-b'],
  g: 'Form nhập lô tối ưu thao tác tay ướt trên tablet.',
  s: 'SC-14 § 3–§ 7; screen-list "Tablet"; ADR-010',
  sc: ['Lưới nút tàu/品目/規格, bàn phím số, nút ≥ 48px', 'Điền sẵn 委託/買付 theo 荷主', '`useDraftForm` + `useIdempotentSubmit` + NetworkBanner'],
  dod: ['E2E: mất mạng → gửi lại → 1 lô', 'E2E: SC-14 điền sẵn 委託 theo 荷主; 品目 無効 không hiện'],
});
I('I-05-02', 'E05', 'SC-15 Thẩm định độ tươi 目利き và 符丁 có ảnh', {
  c: 'HITL 目利き/符丁',
  g: 'Người có chức năng 目利き ghi hạng + ảnh; lịch sử chỉ thêm; sửa sau 成立 cần lý do.',
  s: 'SC-15, FT-11, FT-12, ADR-007, BR-11, BR-12, BR-13, GAP-06, GAP-07, D-25, D-26, US-03',
  dod: ['Không phải 目利き → không ghi được hạng', 'Không có gợi ý tự động'],
});
L('T-05-02-a', 'I-05-02', 'db', 'Bảng lot_appraisals (append-only) + lot_marks + bucket ảnh + migrate market_mark cũ', {
  role: 'BE-1', ph: 3, c: 'HITL 目利き/符丁', dep: ['T-05-01-a', 'T-04-05-a'],
  g: 'Lưu thẩm định dạng chỉ thêm, có ảnh (sửa GAP-06, GAP-07).',
  s: 'ADR-007 Việc phải làm; SC-15 Ghi chú LAB-5 [DB] + [DB_GAP] #1; GAP-06; GAP-07; D-19; D-25',
  sc: ['`lot_appraisals` (+client_request_id UNIQUE), không UPDATE/DELETE', '`lot_marks` (mark_id hoặc free_text + ảnh, client_request_id)', 'Bucket private ảnh + policy; script chuyển `lots.market_mark` → `lot_marks.free_text`', 'Bỏ CHECK cứng ≤ 3 ảnh (D-25)'],
  dod: ['pgTAP: UPDATE `lot_appraisals` → lỗi', 'Dữ liệu `market_mark` LAB-2 chuyển đủ'],
});
L('T-05-02-b', 'I-05-02', 'rpc', 'record_appraisal / record_lot_mark + pgTAP HITL', {
  role: 'BE-2', ph: 3, c: 'HITL 目利き/符丁', dep: ['T-05-02-a'],
  g: 'Ghi thẩm định đúng BR-11/BR-12.',
  s: 'SC-15 Ghi chú LAB-5 [RPC]; BR-11; BR-12; D-25; D-26',
  sc: ['Kiểm functions ∋ appraiser (W-MGR không có → chỉ xem)', 'Hạng thuộc `fn_rule(\'freshness_grades\')`; số ảnh ≤ `fn_rule(\'appraisal_photo_max\')`', 'Sau khi lô có giao dịch 成立 → bắt buộc lý do + audit reason'],
  dod: ['pgTAP: không phải 目利き → ERR_NOT_APPRAISER', 'pgTAP: sửa sau 成立 thiếu lý do → ERR_REASON_REQUIRED', 'pgTAP: hạng ngoài danh sách → ERR_GRADE_INVALID; quá ảnh → ERR_PHOTO_LIMIT'],
});
L('T-05-02-c', 'I-05-02', 'fe', 'SC-15 form + timeline + PhotoCapture (nén ≤1MB, giữ IndexedDB)', {
  role: 'FE-1', ph: 3, c: 'HITL 目利き/符丁', dep: ['T-05-02-b', 'T-01-03-b'],
  g: 'Màn thẩm định tablet, chụp ảnh giữ được khi mất mạng.',
  s: 'SC-15 § 3–§ 7; ADR-007; ADR-010; US-03',
  sc: ['Component `PhotoCapture` dùng chung (nén client, tối đa n ảnh, IndexedDB)', 'Form hạng + 符丁 (chọn từ danh mục hoặc ghi tự do + ảnh bảng ghi tay)', 'Timeline lịch sử thẩm định'],
  dod: ['E2E: mở lô đã thẩm định → hạng **không** chọn sẵn (US-03 tc1)', 'Ảnh > 1MB được nén trước khi upload'],
});
I('I-05-03', 'E05', 'SC-16 Phân bổ kênh bán: tách lô, 持越, chuyển kênh', {
  g: 'Một lô tách nhiều phần ở 相対 / せり / 保留, có lịch sử; cuối ngày 持越 hoặc rút.',
  s: 'SC-16, FT-13, FT-19, FT-23, ADR-006, BR-14, BR-15, GAP-04, Q22',
  dod: ['Σ phân bổ ≤ số lượng lô ở DB', 'Phần đã 成立 không chuyển kênh được'],
});
L('T-05-03-a', 'I-05-03', 'db', 'Migration lot_allocations + allocation_events + trigger Σ ≤ quantity + v_allocation_remaining', {
  role: 'BE-1', ph: 3, dep: ['T-05-01-a'],
  g: 'Cho phép tách lô ở nhiều kênh (sửa GAP-04).',
  s: 'ADR-006 Việc phải làm; SC-16 Ghi chú LAB-5 [DB] + [DB_GAP] #2; SC-18 [DB_GAP] #1; BR-14; GAP-04',
  sc: ['`lot_allocations` (channel, quantity, status open/closed/carried_over/withdrawn)', '`allocation_events` lịch sử chuyển kênh', 'Trigger Σ quantity (≠ withdrawn) ≤ lots.quantity', 'View `v_allocation_remaining(allocation_id, quantity, negotiating_qty, concluded_qty, remaining)`'],
  dod: ['pgTAP: phân bổ vượt → ERR_ALLOCATION_EXCEEDS', 'pgTAP: view trừ đúng 交渉中 + 成立'],
});
L('T-05-03-b', 'I-05-03', 'rpc', 'allocate_lot / move_allocation + pgTAP đồng thời', {
  role: 'BE-2', ph: 3, dep: ['T-05-03-a'],
  g: 'Tách/chuyển kênh có khóa hàng, không đụng phần đã bán.',
  s: 'SC-16 Ghi chú LAB-5 [RPC]; BR-14; BR-15; Q22',
  sc: ['`allocate_lot`, `move_allocation` (khóa `lots` FOR UPDATE)', 'Khóa cả số lượng 交渉中 (theo I-00-03)', 'Lô đang trong phiên せり → ERR_IN_AUCTION'],
  dod: ['pgTAP: chuyển phần đã 成立 → ERR_ALLOCATION_LOCKED', 'pgTAP: move song song với create_negotiation không bán vượt'],
});
L('T-05-03-c', 'I-05-03', 'rpc', 'Job đóng ngày: hủy 交渉中 còn lại + close_day_allocations (持越 / 取下げ)', {
  role: 'BE-2', ph: 3, pr: 'Should', dep: ['T-05-03-b', 'T-06-02-a', 'T-01-04-b'],
  g: 'Cuối ngày nghiệp vụ trả số lượng 交渉中 về phân bổ rồi 持越 sang ngày mở kế tiếp.',
  s: 'SC-16 Ghi chú LAB-5 [RPC] close_day_allocations; SC-18 NEEDS_DOMAIN_CONFIRMATION #1; Q22; BR-15; FT-19',
  sc: ['Cron 23:59 JST: giao dịch `negotiating` của ngày → `cancelled` + thông báo (Q22)', '`close_day_allocations`: phần còn lại → `carried_over` sang ngày mở kế tiếp theo `market_calendar`, hoặc `withdrawn` có lý do', 'Không ghi đè `arrivals.business_date` (giữ ngày gốc)'],
  dod: ['pgTAP: ngày kế tiếp là 休市日 → 持越 sang ngày mở sau đó', 'pgTAP: 取下げ thiếu lý do → ERR_REASON_REQUIRED', 'Chạy lại job không tạo phân bổ trùng'],
});
L('T-05-03-d', 'I-05-03', 'fe', 'SC-16 board 4 cột: kéo-thả PC + nút tablet + SplitDialog + HistoryDrawer', {
  role: 'FE-1', ph: 3, dep: ['T-05-03-b'],
  g: 'Board phân bổ dùng được cả PC và tablet.',
  s: 'SC-16 § 3–§ 7; PREMISE § 3 (FT-13 thu hẹp)',
  sc: ['4 cột 未振分 / 相対 / せり / 保留; dnd có hỗ trợ bàn phím (PC)', 'Tablet: nút chọn kênh, không kéo-thả', 'SplitDialog tách số lượng; HistoryDrawer; làm mới 30 giây'],
  dod: ['Tablet viewport không bật dnd', 'Tách 30 → 20/10 cập nhật đúng cột'],
});
L('T-05-03-e', 'I-05-03', 'test', 'E2E buổi sáng: nhập → thẩm định → tách lô → 相対 → chặn chuyển; đo thời gian tablet', {
  role: 'QA', ph: 3, dep: ['T-05-03-d', 'T-05-02-c', 'T-05-01-c', 'T-06-02-c'],
  g: 'Khóa luồng 3.1 của architecture bằng test và số đo thực tế.',
  s: 'SC-16 Ghi chú LAB-5 [Test]; SC-14 Ghi chú LAB-5 [Test]; architecture § 3.1; US-02; US-03; US-04',
  sc: ['Tách 30 → 20/10, tạo 相対 8, chuyển 15 từ phần 相対 → bị chặn', 'Đo thao tác thực tế trên tablet với 3 người dùng thử'],
  dod: ['E2E xanh trên CI', 'Số đo < 30 giây/lô ghi vào báo cáo (nếu vượt → mở bug)'],
});
I('I-05-04', 'E05', 'SC-13 Danh sách lô nhập và in nhãn lô', {
  g: 'Danh sách lô theo ngày với tóm tắt kênh, in nhãn lô PDF.',
  s: 'SC-13, FT-10, FT-13, FT-14',
  dod: ['NAK gọi `select * from lots` → 0 dòng', 'Nhãn A7 có QR'],
});
L('T-05-04-a', 'I-05-04', 'fe', 'SC-13 danh sách + view v_lot_overview + nhãn lô PDF (A7, QR)', {
  role: 'FE-2', ph: 3, dep: ['T-05-03-a', 'T-05-02-a', 'T-01-04-a'],
  g: 'Danh sách lô một truy vấn và in nhãn dùng chung SC-14.',
  s: 'SC-13 Ghi chú LAB-5 + [DB_GAP] #1; SC-14 Ghi chú LAB-5 (FT-14); ADR-011; A-08',
  sc: ['View `v_lot_overview` (security_invoker): lô + hạng hiện tại + tóm tắt kênh + số 成立', 'List + lọc qua URL + chip; làm mới 60 giây giờ cao điểm', 'Renderer nhãn lô PDF A7, QR = mã lô + URL SC-15 (Should)'],
  dod: ['pgTAP: NAK `select * from lots` → 0 dòng', 'PDF nhãn mở được trên máy in A7 thử'],
});

// ───────────── E06 相対 & quyền mua 2 cấp ─────────────
E('E06', 'E06 Giao dịch 相対 & kiểm quyền mua 2 cấp', {
  c: 'Quyền mua 2 cấp',
  scope: ['Hàm `fn_check_buyer_eligibility` + `trg_enforce_buyer_tier` (ADR-002)', 'SC-18 tạo/chốt/sửa giao dịch, SC-17 danh sách, SC-19 xác nhận phía bên mua, SC-20 予約', 'Sửa sau chốt có duyệt (ADR-008) và ngoại lệ đình chỉ (BR-05)'],
  s: 'SC-17, SC-18, SC-19, SC-20, ADR-002, ADR-006, ADR-008, BR-04…BR-06, BR-17…BR-20, GAP-08, GAP-09, GAP-10, D-21, D-22, D-23, US-01, US-05, US-06, US-07',
  notes: ['Quyền mua kiểm ở DB, UI chỉ hiển thị trước (business-rules lời đầu)', '買出人 (cấp 2) bị từ chối tuyệt đối khi mua từ 卸売業者', 'Chốt 成立 bằng app **hoặc** xác nhận miệng/điện thoại kèm tên người xác nhận (BR-18)'],
});
I('I-06-01', 'E06', 'Kiểm quyền mua 2 cấp và hạn mức ở DB (ADR-002)', {
  c: 'Quyền mua 2 cấp',
  g: 'Mọi đường ghi giao dịch (相対, せり, sửa) đi qua cùng một hàm kiểm và một trigger chặn cuối.',
  s: 'ADR-002, BR-03, BR-04, BR-05, BR-06, BR-19, GAP-08, GAP-09, D-21, X-2',
  dod: ['8 case ADR-002 + case biên xanh', 'Insert trực tiếp vượt quyền bị trigger chặn'],
});
L('T-06-01-a', 'I-06-01', 'db', 'Migration transactions TO-BE + transaction_corrections + eligibility_overrides + RLS select', {
  role: 'BE-1', ph: 3, c: 'Quyền mua 2 cấp', dep: ['T-05-03-a', 'T-04-04-a'],
  g: 'Schema giao dịch gắn phần phân bổ, đủ cột cho xác nhận miệng, idempotency và khóa lạc quan.',
  s: 'SC-18 Ghi chú LAB-5 [DB] + [DB_GAP] #3–#5; SC-17 Ghi chú LAB-5 [DB]; SC-19 [DB_GAP] #1–#3; ADR-006; D-22; D-23; GAP-10',
  sc: ['`transactions`: `allocation_id` (+lot_id suy ra), status draft/negotiating/concluded/cancelled, `confirm_method`, CHECK `confirmed_by_name` khi verbal/phone, `override_id`, `client_request_id` UNIQUE, `trade_no` S-YYMMDD-NNNN, `created_by`, `submitted_at`, `updated_at`, `delivery_note`', '`transaction_corrections` + partial unique `WHERE status=\'requested\'`; `eligibility_overrides`', 'RLS `transactions_select`: bên mua chỉ dòng của mình, không thấy draft; gắn `fn_audit`'],
  dod: ['pgTAP: NAK-A không thấy giao dịch NAK-B, không thấy draft', 'pgTAP: verbal thiếu tên → lỗi CHECK', 'pgTAP: 2 yêu cầu sửa đang chờ → lỗi unique'],
});
L('T-06-01-b', 'I-06-01', 'db', 'fn_buyer_exposure + fn_check_buyer_eligibility(p_exclude_transaction_id) + 8 case pgTAP', {
  role: 'BE-1', ph: 3, c: 'Quyền mua 2 cấp', dep: ['T-06-01-a', 'T-03-01-c', 'T-09-02-a'],
  g: 'Một hàm quyết định ai được làm bên mua, dùng chung SC-18/SC-19/SC-23.',
  s: 'ADR-002 Việc phải làm; SC-10 Ghi chú LAB-5; SC-18 [DB_GAP] #2; BR-04; BR-05; BR-06; GAP-08; D-21; Q25',
  sc: ['`fn_buyer_exposure`: hóa đơn chưa trả đủ + 成立 chưa vào hóa đơn + 交渉中 (sửa GAP-08)', '`fn_check_buyer_eligibility(buyer, seller, amount, business_date, p_exclude_transaction_id)` trả mã lỗi + thông điệp JP', '`credit_limit = 0` = không cho nợ (Q25 mặc định)'],
  dod: ['pgTAP 8 case: cấp 2 → ERR_TIER; hết hạn → ERR_QUALIFICATION; đình chỉ → ERR_SUSPENDED; có ngoại lệ → OK; vượt hạn mức → ERR_CREDIT; đúng biên hạn mức → OK; 仲卸 bán cho 買出人 không bảo lãnh → ERR_NOT_SPONSORED; hợp lệ → OK', 'pgTAP biên: 交渉中 tính vào exposure; kiểm lại lúc chốt không đếm trùng chính giao dịch (D-21)'],
});
L('T-06-01-c', 'I-06-01', 'db', 'Trigger trg_enforce_buyer_tier + trigger chống bán vượt trên phần phân bổ', {
  role: 'BE-2', ph: 3, c: 'Quyền mua 2 cấp', dep: ['T-06-01-b'],
  g: 'Chặn cuối ở DB kể cả khi có đường ghi bỏ qua RPC (sửa GAP-09).',
  s: 'ADR-002; BR-04; BR-19; GAP-09; X-2',
  sc: ['`trg_enforce_buyer_tier` BEFORE INSERT/UPDATE buyer_id/status trên `transactions`', 'Trigger Σ (negotiating + concluded) ≤ `lot_allocations.quantity` với khóa hàng'],
  dod: ['pgTAP: insert trực tiếp (role postgres giả lập bypass RPC) với KAI làm bên mua → lỗi ERR_TIER', 'pgTAP: insert vượt phần phân bổ → ERR_OVERSELL'],
});
I('I-06-02', 'E06', 'SC-18 Đăng ký và chốt giao dịch 相対', {
  c: '相対 xác nhận miệng',
  g: 'Nhân viên tạo giao dịch, chuyển 交渉中, chốt 成立 bằng app hoặc xác nhận miệng/điện thoại, không bán vượt.',
  s: 'SC-18, FT-15, FT-17, BR-17, BR-18, BR-19, ADR-010, US-01, US-05, US-06',
  dod: ['Mất mạng gửi lại 2 lần → 1 giao dịch', '口頭/電話 bắt buộc tên người xác nhận'],
});
L('T-06-02-a', 'I-06-02', 'rpc', 'create / update / cancel_negotiation (khóa hàng + idempotency)', {
  role: 'BE-2', ph: 3, c: 'Quyền mua 2 cấp', dep: ['T-06-01-c'],
  g: 'Ghi giao dịch an toàn đồng thời, kiểm quyền mua ngay từ draft.',
  s: 'SC-18 Ghi chú LAB-5 [RPC]; BR-17; BR-19; ADR-010; SC-18 NEEDS_DOMAIN_CONFIRMATION #4',
  sc: ['Chỉ phần phân bổ kênh 相対 (ERR_CHANNEL); số lượng ≤ còn lại', 'Gọi `fn_check_buyer_eligibility` ở create/update (từ chối tuyệt đối từ draft)', 'Idempotent theo `client_request_id`; `updated_at` tăng mỗi lần sửa'],
  dod: ['pgTAP: 2 phiên gửi cùng phần phân bổ → không bán vượt (1 thành công, 1 ERR_OVERSELL)', 'pgTAP: ngày 休市日 → ERR_MARKET_CLOSED; kênh sai → ERR_CHANNEL'],
});
L('T-06-02-b', 'I-06-02', 'rpc', 'conclude_negotiation: nhánh app (ERR_STALE) và nhánh 口頭/電話 + email 成立', {
  role: 'BE-1', ph: 3, c: '相対 xác nhận miệng', dep: ['T-06-02-a', 'T-01-04-b'],
  g: 'Chốt 成立 theo BR-18, kiểm lại quyền mua lúc chốt.',
  s: 'SC-18 Implementation Mapping; SC-19 Ghi chú LAB-5 [RPC]; BR-18; D-21; D-22; D-27; X-4',
  sc: ['Nhánh `app`: chỉ bên mua của giao dịch; `p_expected_updated_at` khác → ERR_STALE', 'Nhánh `verbal`/`phone`: nhân viên + `confirmed_by_name` bắt buộc (ERR_CONFIRMER_REQUIRED)', 'Kiểm lại eligibility với `p_exclude_transaction_id`; enqueue email `negotiation_concluded` gửi ngay sau commit'],
  dod: ['pgTAP: bên mua khác chốt → ERR_NOT_FOUND', 'pgTAP: giá đổi sau khi bên mua mở → ERR_STALE', 'pgTAP: đình chỉ giữa lúc 交渉中 → chốt bị ERR_SUSPENDED'],
});
L('T-06-02-c', 'I-06-02', 'fe', 'SC-18 form + EligibilityPanel (4 biến thể từ chối) + ConcludePanel', {
  role: 'FE-1', ph: 3, c: '相対 xác nhận miệng', dep: ['T-06-02-b', 'T-01-03-b'],
  g: 'Form giao dịch hiển thị trước lý do bị từ chối và chốt bằng xác nhận miệng.',
  s: 'SC-18 § 3–§ 7; SC-18 Ghi chú LAB-5 [FE]',
  sc: ['Form chọn phần phân bổ, bên mua, SL, giá, `delivery_note`', 'EligibilityPanel: cấp 2 / hết hạn / đình chỉ (nút xin ngoại lệ) / vượt hạn mức', 'ConcludePanel: 口頭 / 電話 + tên người xác nhận; `useDraftForm` + `useIdempotentSubmit`'],
  dod: ['Thông điệp từ chối hiển thị nguyên văn JP', 'Không có ô nhập tier'],
});
L('T-06-02-d', 'I-06-02', 'test', 'E2E 相対: US-01 tc1/tc2, US-05 tc2, US-06 tc2, US-07 tc3, SC-19 mobile, mất mạng', {
  role: 'QA', ph: 3, c: 'Quyền mua 2 cấp', dep: ['T-06-02-c', 'T-06-03-c', 'T-06-04-b'],
  g: 'Khóa luồng lõi 3.2 bằng E2E.',
  s: 'SC-18 Ghi chú LAB-5 [Test E2E]; SC-19 Ghi chú LAB-5 [Test]; SC-10 Ghi chú LAB-5 (Test); US-01; US-05; US-06; US-07',
  sc: ['KAI làm bên mua → từ chối; SBK-02 đình chỉ → từ chối → xin ngoại lệ → ADM duyệt → tạo được', 'Chốt bằng app trên viewport 390×844; nhân viên đổi giá giữa chừng → ERR_STALE; bên mua khác mở URL → 404', 'Sửa sau chốt → ADM duyệt → audit có before/after', 'Mất mạng gửi lại 2 lần → 1 giao dịch'],
  dod: ['Tất cả kịch bản xanh trên CI'],
});
I('I-06-03', 'E06', 'Sửa sau chốt và ngoại lệ đình chỉ có duyệt', {
  c: 'Khóa kỳ 締め',
  g: 'Sửa SL/giá/bên mua sau 成立 qua duyệt của 市場管理者; ngoại lệ đình chỉ duyệt từng giao dịch.',
  s: 'SC-18, FT-18, ADR-008, BR-05, BR-20, BR-29, GAP-10, Q23, Q24, US-07',
  dod: ['Kỳ `locked` → sửa bị chặn', 'Ngoại lệ hết hạn cuối ngày nghiệp vụ'],
});
L('T-06-03-a', 'I-06-03', 'rpc', 'request / approve / reject_correction (kiểm kỳ khóa, tồn bán lẻ, hóa đơn đã phát hành)', {
  role: 'BE-2', ph: 3, c: 'Khóa kỳ 締め', dep: ['T-06-02-b', 'T-01-02-c', 'T-09-01-a'],
  g: 'Luồng sửa có duyệt, audit trước/sau (sửa GAP-10).',
  s: 'ADR-008 Việc phải làm; SC-18 Ghi chú LAB-5 [RPC]; SC-26 Ràng buộc chéo; BR-20; BR-29; GAP-10; Q23; Q24',
  sc: ['`request_correction` (lý do enum + ghi chú; ERR_CORRECTION_PENDING)', '`approve_correction`: chỉ ADM; kiểm lại eligibility (exclude self); SL mới ≥ Σ đã bán lẻ; nếu đã vào hóa đơn kỳ mở → tạo nhắc void + phát hành lại (Q24)', 'Quantity = 0 = hủy giao dịch đã 成立 (Q23)'],
  dod: ['pgTAP: kỳ `locked` → ERR_PERIOD_LOCKED', 'pgTAP: SL mới < đã bán lẻ → lỗi', 'pgTAP: duyệt sinh đúng 1 dòng audit có reason'],
});
L('T-06-03-b', 'I-06-03', 'rpc', 'request / decide_eligibility_override (từng giao dịch, hết hạn cuối ngày)', {
  role: 'BE-1', ph: 3, c: 'Quyền mua 2 cấp', dep: ['T-06-01-b'],
  g: 'Ngoại lệ cho bên mua đang 取引停止 theo BR-05.',
  s: 'SC-18 Implementation Mapping; BR-05; PREMISE § 2 #4',
  sc: ['`request_eligibility_override` (卸売業者), `decide_eligibility_override` (ADM)', 'Ngoại lệ gắn đúng một giao dịch, hết hạn cuối `business_date`'],
  dod: ['pgTAP: ngoại lệ hôm qua không dùng được hôm nay', 'pgTAP: dùng ngoại lệ cho giao dịch khác → ERR_SUSPENDED', 'pgTAP: không phải ADM duyệt → ERR_FORBIDDEN'],
});
L('T-06-03-c', 'I-06-03', 'fe', 'SC-18 CorrectionForm + ApprovalPanel (ADM) + yêu cầu/duyệt ngoại lệ', {
  role: 'FE-1', ph: 3, c: 'Khóa kỳ 締め', dep: ['T-06-03-a', 'T-06-03-b', 'T-06-02-c'],
  g: 'Khu vực sửa sau chốt và duyệt trên SC-18.',
  s: 'SC-18 § 3–§ 7 (khu vực sửa); ADR-008',
  sc: ['CorrectionForm: lý do (再計量/損傷/入力ミス/その他) + ghi chú, so sánh trước/sau', 'ApprovalPanel cho ADM; banner kỳ khóa', 'Nút xin ngoại lệ từ EligibilityPanel'],
  dod: ['ADM thấy panel duyệt, W-FLR không thấy', 'Kỳ khóa → form ẩn, hiển thị lý do'],
});
I('I-06-04', 'E06', 'SC-17 / SC-19 Danh sách giao dịch và xác nhận phía bên mua', {
  c: '相対 xác nhận miệng',
  g: 'Nhân viên xem bảng giao dịch; bên mua xem thẻ giao dịch của mình và bấm 承認 trên điện thoại.',
  s: 'SC-17, SC-19, FT-15, FT-17, PERM-06, PERM-09, GAP-16',
  dod: ['Bên mua A không thấy giao dịch của B kể cả gọi API trực tiếp'],
});
L('T-06-04-a', 'I-06-04', 'fe', 'SC-17 hai chế độ (bảng nhân viên / thẻ bên mua) + lọc URL', {
  role: 'FE-2', ph: 3, dep: ['T-06-01-a', 'T-01-03-a'],
  g: 'Danh sách 相対 theo người xem (sửa lọc client-side của LAB-2).',
  s: 'SC-17 § 3–§ 7; GAP-16 (`app/(app)/negotiations/page.tsx:10`)',
  sc: ['Bảng nhân viên (trade_no, trạng thái, bên mua, SL, giá)', 'Thẻ bên mua (chỉ của mình); lọc qua URL'],
  dod: ['E2E: bên mua A không thấy giao dịch B', 'W-ACC thấy draft (NEEDS_DOMAIN_CONFIRMATION #1 mặc định)'],
});
L('T-06-04-b', 'I-06-04', 'fe', 'SC-19 xác nhận mobile: thẻ, nút sticky, hộp xác nhận, banner ERR_STALE', {
  role: 'FE-2', ph: 3, c: '相対 xác nhận miệng', dep: ['T-06-02-b', 'T-06-04-a'],
  g: 'Bên mua chốt giao dịch trên điện thoại.',
  s: 'SC-19 § 3–§ 7; BR-18; D-22',
  sc: ['Thẻ nội dung giao dịch, nút 承認 sticky, hộp xác nhận', 'Banner khi nội dung đã đổi (ERR_STALE) → tải lại', 'URL của bên mua khác → 404'],
  dod: ['Hiển thị đúng ở 390×844', 'Không có nút 辞退 (mặc định I-00-03)'],
});
I('I-06-05', 'E06', 'SC-20 予約相対 (đặt trước)', {
  pr: 'Should',
  g: 'Ghi nhận đặt trước của bên mua cấp 1 và khớp với giao dịch.',
  s: 'SC-20, FT-16',
  dod: ['Bên mua A không thấy đặt trước của B', '成立 → `照合済`'],
});
L('T-06-05-a', 'I-06-05', 'rpc', 'Bảng reservations + RPC create / cancel_reservation + khớp trong create/conclude', {
  role: 'BE-2', ph: 3, pr: 'Should', c: 'Quyền mua 2 cấp', dep: ['T-06-02-b'],
  g: 'Đặt trước chỉ cho cấp 1, khớp khi 成立.',
  s: 'SC-20 Ghi chú LAB-5 [DB] + [RPC] + [DB_GAP] #1',
  sc: ['`reservations` (+created_by, cancelled_reason) + RLS + CHECK tier 1', '`create_reservation`, `cancel_reservation`; `p_reservation_id` trong create/conclude_negotiation', 'Giao dịch khớp bị hủy → đặt trước quay về 受付中; job 0:05 hủy đặt trước quá ngày'],
  dod: ['pgTAP: KAI tạo → ERR_TIER; ngày quá khứ → ERR_INVALID_DATE', 'pgTAP: 成立 → `matched`; hủy giao dịch → `open`'],
});
L('T-06-05-b', 'I-06-05', 'fe', 'SC-20 danh sách + drawer (chế độ nhân viên / bên mua)', {
  role: 'FE-2', ph: 3, pr: 'Should', dep: ['T-06-05-a'],
  g: 'Màn đặt trước.',
  s: 'SC-20 § 3–§ 7',
  sc: ['List + drawer tạo/hủy', 'Nút "tạo 相対 từ đặt trước" sang SC-18'],
  dod: ['E2E: bên mua A không thấy đặt trước của B'],
});

// ───────────── E07 Phiên せり ─────────────
E('E07', 'E07 Phiên せり (chỉ ghi kết quả)', {
  c: 'Quyền mua 2 cấp',
  scope: ['SC-21 thiết lập phiên, SC-22 tiến trình trên tablet, SC-23 nhập 落札 (chia lô, 不落), SC-24 màn hình sàn (Could)'],
  s: 'SC-21, SC-22, SC-23, SC-24, ADR-009, ADR-010, BR-16, BR-04, GAP-09, GAP-18, FT-20…FT-24, Q32, Q33',
  notes: ['Không làm đấu giá điện tử; 競り人 nhập kết quả (ADR-009)', 'Bên mua trong せり cũng đi qua `fn_check_buyer_eligibility`'],
});
I('I-07-01', 'E07', 'SC-21 Thiết lập phiên せり', {
  g: 'Tạo phiên, chọn lô từ phần phân bổ kênh せり, sắp thứ tự, bắt đầu phiên.',
  s: 'SC-21, FT-20, ADR-009, GAP-18',
  dod: ['Trạng thái phiên chỉ đi một chiều', '競り人 là nhân viên có chức năng auctioneer'],
});
L('T-07-01-a', 'I-07-01', 'db', 'Migration auction_sessions TO-BE + auction_entries (partial unique) + audit', {
  role: 'BE-1', ph: 4, dep: ['T-05-03-a'],
  g: 'Schema phiên せり đúng (sửa GAP-18).',
  s: 'SC-21 Ghi chú LAB-5 DB; ADR-009 Việc phải làm; GAP-18; D-24',
  sc: ['`auction_sessions`: `auctioneer_profile_id`, `start_time`, `method`, trạng thái một chiều', '`auction_entries` thay `auction_lots`; partial unique một phần phân bổ chỉ ở một phiên mở', 'Trigger BR-40; gắn `fn_audit`'],
  dod: ['pgTAP: đổi trạng thái ngược → ERR_SESSION_STATE', 'pgTAP: phần phân bổ ở 2 phiên → lỗi unique'],
});
L('T-07-01-b', 'I-07-01', 'rpc', 'create_auction_session / set_auction_entries / start_session + pgTAP', {
  role: 'BE-2', ph: 4, dep: ['T-07-01-a'],
  g: 'Thiết lập và bắt đầu phiên.',
  s: 'SC-21 Implementation Mapping; Q32',
  sc: ['Kiểm 競り人 (ERR_NOT_AUCTIONEER), số phiên trùng (ERR_DUPLICATE_SESSION)', 'Chỉ phần phân bổ kênh せり (ERR_ALLOCATION_CHANNEL / ERR_ALLOCATION_TAKEN)', 'Thêm lô vào phiên đang chạy → cuối hàng chờ (Q32)'],
  dod: ['pgTAP: 休市日, trùng số phiên, lô đã ở phiên khác, không có lô (ERR_NO_ENTRIES)'],
});
L('T-07-01-c', 'I-07-01', 'fe', 'SC-21 trang setup: SessionTabs, chọn nhiều 候補, sắp thứ tự ↑/↓ (kéo-thả PC)', {
  role: 'FE-2', ph: 4, dep: ['T-07-01-b', 'T-01-03-a'],
  g: 'Màn thiết lập phiên.',
  s: 'SC-21 § 3–§ 7',
  sc: ['Tab phiên trong ngày (giờ từ `auction_start_times`)', 'Bảng 候補 chọn nhiều; danh sách thứ tự ↑/↓; dnd chỉ PC', 'Ẩn menu せり với NAK/SBK/KAI'],
  dod: ['E2E: tạo phiên → thêm 3 lô → đổi thứ tự → bắt đầu → sang SC-22'],
});
I('I-07-02', 'E07', 'SC-22 / SC-23 Tiến trình phiên và nhập kết quả 落札', {
  c: 'Quyền mua 2 cấp',
  g: '競り人 nhập mã bên mua ngắn + giá + SL ≤ 5 giây/lô; chia lô; 不落 chuyển kênh.',
  s: 'SC-22, SC-23, FT-21, FT-22, FT-23, BR-16, BR-04, GAP-09, GAP-18, ADR-010',
  dod: ['Bên mua không đủ quyền bị từ chối như 相対', 'Gửi trùng cùng id → 1 giao dịch'],
});
L('T-07-02-a', 'I-07-02', 'rpc', 'record_auction_result + check_auction_buyer (dùng fn_check_buyer_eligibility, chia lô)', {
  role: 'BE-1', ph: 4, c: 'Quyền mua 2 cấp', dep: ['T-07-01-b', 'T-06-01-c'],
  g: 'Ghi kết quả せり với cùng kiểm quyền mua như 相対 (sửa GAP-09 phần せり).',
  s: 'SC-23 Ghi chú LAB-5 DB/RPC; ADR-002; ADR-009; BR-04; BR-16; GAP-09',
  sc: ['`check_auction_buyer(short_no)` trả tên + kết quả kiểm để hiển thị trước', '`record_auction_result`: tạo `transactions` concluded, người nhập thật (GAP-18), chia lô nhiều bên mua, idempotent'],
  dod: ['pgTAP 9 case: 8 case ADR-002 + chia lô vượt 残数 → ERR_OVERSELL', 'pgTAP: mã ngắn không tồn tại → ERR_BUYER_NOT_FOUND'],
});
L('T-07-02-b', 'I-07-02', 'rpc', 'mark_unsold (tách phần dư sang kênh khác) + close_session (chặn khi còn pending)', {
  role: 'BE-2', ph: 4, pr: 'Should', dep: ['T-07-02-a', 'T-05-03-b'],
  g: 'Xử lý 不落 và đóng phiên một chiều.',
  s: 'SC-23 Ghi chú LAB-5 (mark_unsold); SC-22 Ghi chú LAB-5 (close_session); FT-23; GAP-18; X-3',
  sc: ['`mark_unsold`: tách allocation phần dư → 相対/保留, ghi `allocation_events`', '`close_session`: còn entry `pending` → ERR_ENTRIES_PENDING'],
  dod: ['pgTAP: lô đã bán một phần → phần dư đúng số', 'pgTAP: mở lại phiên đã đóng → ERR_SESSION_STATE'],
});
L('T-07-02-c', 'I-07-02', 'fe', 'SC-22 board tablet + Realtime useAuctionChannel + hàng nháp cấp phiên', {
  role: 'FE-1', ph: 4, dep: ['T-07-02-b', 'T-01-03-b'],
  g: 'Bảng điều khiển phiên trên tablet, đồng bộ giữa các máy.',
  s: 'SC-22 Ghi chú LAB-5; ADR-009 (kênh Realtime `auction:{id}`); ADR-010',
  sc: ['E05 lô hiện tại cỡ lớn, E08 hàng chờ, E09 log, phím tắt', 'Hook `useAuctionChannel` (dùng chung SC-24), phát sự kiện sau RPC', 'Hàng nháp cấp phiên (E11) dùng `useIdempotentSubmit`'],
  dod: ['Vitest: mô phỏng mất mạng giữa 3 lô liên tiếp → gửi lại đúng thứ tự, không trùng'],
});
L('T-07-02-d', 'I-07-02', 'fe', 'SC-23 modal 落札: 3 ô số, kiểm hai nhịp, chia lô, chọn đích 不落', {
  role: 'FE-1', ph: 4, c: 'Quyền mua 2 cấp', dep: ['T-07-02-c'],
  g: 'Nhập kết quả nhanh, hiện quyền mua trước khi ghi.',
  s: 'SC-23 § 3–§ 7',
  sc: ['3 ô số (mã ngắn, đơn giá, SL) + bàn phím số', 'Nhịp 1: `check_auction_buyer`; nhịp 2: ghi', 'Chia lô cho nhiều bên mua; chọn đích 不落'],
  dod: ['E2E: gửi trùng cùng `client_request_id` → 1 transaction', 'KAI nhập mã → thông điệp từ chối JP'],
});
L('T-07-02-e', 'I-07-02', 'test', 'E2E phiên 5 lô (3 bán, 1 chia, 1 不落) + đo hiệu năng tablet/Tokyo', {
  role: 'QA', ph: 4, dep: ['T-07-02-d', 'T-07-01-c'],
  g: 'Khóa luồng せり và chứng minh mục tiêu thời gian.',
  s: 'SC-22 Ghi chú LAB-5 (Test E2E); SC-23 Ghi chú LAB-5 (Test hiệu năng); US-08',
  sc: ['Phiên 5 lô: 3 bán, 1 chia 2 bên mua, 1 不落 → đóng phiên → phần 不落 hiện ở SC-16', 'Đo ≤ 5 giây/lô trên tablet thật; RPC p95 ≤ 300ms trên staging Tokyo'],
  dod: ['E2E xanh', 'Số đo ghi vào báo cáo, vượt ngưỡng → mở bug'],
});
I('I-07-03', 'E07', 'SC-24 Màn hình công khai trên sàn (TV)', {
  pr: 'Could', c: '公表 theo 卸売市場法',
  g: 'TV trên sàn hiển thị kết quả phiên realtime bằng URL có token.',
  s: 'SC-24, FT-24, D-17, Q33',
  dod: ['Ghi ở SC-23 → TV cập nhật ≤ 2 giây', 'Token hết hạn cuối ngày'],
});
L('T-07-03-a', 'I-07-03', 'rpc', 'display_tokens + RPC issue_display_token / get_display_snapshot + broadcast', {
  role: 'BE-2', ph: 6, pr: 'Could', dep: ['T-07-02-a'],
  g: 'Truy cập chỉ đọc cho TV không cần tài khoản.',
  s: 'SC-24 Ghi chú LAB-5 DB/BE; D-17; Q33',
  sc: ['Bảng `display_tokens` (session, hết hạn cuối ngày, revoked)', '`issue_display_token`, `get_display_snapshot` (ẩn giá loại nhạy cảm theo Q33)', 'Broadcast sau RPC せり'],
  dod: ['pgTAP 4 case: token hợp lệ; hết hạn; bị thu hồi; sai phiên → ERR_DISPLAY_TOKEN'],
});
L('T-07-03-b', 'I-07-03', 'fe', 'Trang TV toàn màn: font lớn, reconnect + poll fallback, Wake Lock', {
  role: 'FE-2', ph: 6, pr: 'Could', dep: ['T-07-03-a', 'T-07-02-c'],
  g: 'Màn hình sàn chạy cả ngày không cần thao tác.',
  s: 'SC-24 § 3–§ 7; PREMISE § 3 (FT-24 thu hẹp)',
  sc: ['Route `/display/[sessionId]?t=token` ngoài layout (app)', 'Reconnect + poll fallback 10 giây; Wake Lock; overlay trạng thái'],
  dod: ['Ngắt mạng 60 giây → tự hồi phục', 'Đổi ngày → E10 thông báo hết phiên'],
});

// ───────────── E08 Bán trong chợ ─────────────
E('E08', 'E08 Bán trong chợ 仲卸 → 買出人', {
  c: 'Quyền mua 2 cấp',
  scope: ['SC-25 phiếu bán cho 買出人 (chỉ 仲卸 bảo lãnh), SC-26 tồn hàng 仲卸', 'FT-27 công nợ 買出人 (Could) chỉ xem tổng'],
  s: 'SC-25, SC-26, FT-25, FT-26, FT-27, BR-03, X-8, GAP-21, D-20, Q34',
  notes: ['買出人 (cấp 2) chỉ mua từ 仲卸 đã bảo lãnh mình — cưỡng chế bằng trigger trên `retail_sales`'],
});
I('I-08-01', 'E08', 'SC-25 Phiếu bán cho 買出人', {
  c: 'Quyền mua 2 cấp',
  g: '仲卸 lập phiếu bán cho 買出人 mình bảo lãnh, trừ tồn FIFO, in A5.',
  s: 'SC-25, FT-25, BR-03, X-8, GAP-21, D-19, D-20, Q34',
  dod: ['Bán cho 買出人 không bảo lãnh → từ chối', 'Không bán vượt tồn'],
});
L('T-08-01-a', 'I-08-01', 'db', 'Migration retail_slips + retail_sales + số phiếu + trigger bảo lãnh/tồn + RLS', {
  role: 'BE-1', ph: 4, c: 'Quyền mua 2 cấp', dep: ['T-06-01-a'],
  g: 'Mô hình phiếu bán (đầu phiếu + dòng) theo D-20 (sửa GAP-21).',
  s: 'SC-25 Ghi chú LAB-5 DB; D-20; D-19; X-8; GAP-21',
  sc: ['`retail_slips` (slip_no seq, 仲卸, 買出人, thanh toán, hủy) + `retail_sales` (dòng, client_request_id)', 'Trigger: 買出人 phải được 仲卸 này bảo lãnh với 登録 hiệu lực; tồn không âm', 'RLS: 仲卸 thấy phiếu của mình, KAI thấy phiếu mua của mình'],
  dod: ['pgTAP: KAI khác đăng nhập không thấy phiếu (hồi quy kiểu GAP-16)', 'pgTAP: insert trực tiếp cho KAI không bảo lãnh → ERR_NOT_SPONSORED'],
});
L('T-08-01-b', 'I-08-01', 'rpc', 'create_retail_sale (FIFO, khóa nguồn) + cancel_retail_slip + pgTAP', {
  role: 'BE-2', ph: 4, c: 'Quyền mua 2 cấp', dep: ['T-08-01-a'],
  g: 'Ghi phiếu bán an toàn đồng thời.',
  s: 'SC-25 Ghi chú LAB-5 RPC; D-20; Q34',
  sc: ['`create_retail_sale`: chọn nguồn mua FIFO, khóa hàng nguồn, idempotent', '`cancel_retail_slip` có lý do (D-20 — RPC chưa có trong index)', 'Thuế 8% theo Q34 mặc định'],
  dod: ['pgTAP: khách không bảo lãnh → ERR_NOT_SPONSORED; vượt tồn → ERR_INVENTORY_EXCEEDED', 'pgTAP: 2 phiên bán đồng thời không âm tồn; gửi trùng id → 1 phiếu'],
});
L('T-08-01-c', 'I-08-01', 'fe', 'SC-25 danh sách + form phiếu + in A5 + biến thể KAI chỉ xem', {
  role: 'FE-2', ph: 4, dep: ['T-08-01-b'],
  g: 'Màn phiếu bán trên tablet và biến thể xem cho 買出人.',
  s: 'SC-25 § 3–§ 7',
  sc: ['Danh sách + ngăn kéo; form 1 dòng (nhiều dòng khi D4 chốt)', 'CSS in A5', 'KAI: chỉ xem trên điện thoại'],
  dod: ['E2E: NAK tạo phiếu → in; KAI khác không thấy phiếu'],
});
I('I-08-02', 'E08', 'SC-26 Tồn hàng 仲卸', {
  pr: 'Should',
  g: '仲卸 xem tồn theo nguồn mua (せり chia lô, 相対) trừ đã bán lẻ.',
  s: 'SC-26, FT-26, FT-27',
  dod: ['Tồn khớp giữa SC-25 và SC-26'],
});
L('T-08-02-a', 'I-08-02', 'db', 'View v_intermediate_inventory (security_invoker) + pgTAP', {
  role: 'BE-1', ph: 4, pr: 'Should', dep: ['T-08-01-a'],
  g: 'Một nguồn tính tồn dùng chung cho SC-25/SC-26.',
  s: 'SC-26 Ghi chú LAB-5 DB',
  sc: ['View tồn = mua (せり + 相対 成立) − bán lẻ (không hủy), theo nguồn', 'Tồn qua ngày theo NEEDS_DOMAIN_CONFIRMATION D8 (mặc định cho bán tiếp)'],
  dod: ['pgTAP: mua せり chia lô, mua 相対, bán lẻ → tồn đúng', 'pgTAP: RLS hai 仲卸 không thấy tồn của nhau'],
});
L('T-08-02-b', 'I-08-02', 'fe', 'SC-26 hai tab + dòng mở rộng nguồn mua + nút bán nhanh sang SC-25', {
  role: 'FE-2', ph: 4, pr: 'Should', dep: ['T-08-02-a', 'T-08-01-c'],
  g: 'Màn tồn hàng cho 仲卸.',
  s: 'SC-26 § 3–§ 7',
  sc: ['Tab tồn theo 品目; dòng mở rộng nguồn mua', 'Nút bán nhanh → SC-25 điền sẵn', 'Tab 売掛残 (FT-27 Could) chỉ khung, ẩn khi D10 chưa chốt'],
  dod: ['Số tồn trên màn = view'],
});
