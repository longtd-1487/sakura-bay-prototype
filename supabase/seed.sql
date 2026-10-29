-- =====================================================================
-- Dữ liệu mẫu (mock) – KHÔNG phải dữ liệu nghiệp vụ thật
-- Chạy SAU 001_schema.sql. Tài khoản đăng nhập tạo bằng scripts/seed-users.mjs
-- =====================================================================
insert into market_rules (key, value, description) values
 ('fee_rate', 0.055, '卸売手数料 5.5% trên giá trị giao dịch (giả định)'),
 ('incentive_rate', 0.01, '完納奨励金 1% nếu thanh toán đủ & đúng hạn (giả định)'),
 ('due_days', 15, 'Hạn thanh toán: 15 ngày sau khi kết thúc kỳ (giả định)');

insert into participants (id, code, name, role, tier, license_no, credit_limit, status, parent_intermediate_id) values
 ('a0000000-0000-0000-0000-000000000001','ADM-01','Ban quản lý chợ Vịnh Sakura (市場管理者)','admin',0,null,0,'active',null),
 ('a0000000-0000-0000-0000-000000000002','WHS-01','Sakura Suisan 卸売 (卸売業者)','wholesaler',0,'W-2020-001',0,'active',null),
 ('a0000000-0000-0000-0000-000000000011','NAK-01','Minato Shokuhin (仲卸)','intermediate',1,'N-2021-014',3000000,'active',null),
 ('a0000000-0000-0000-0000-000000000012','NAK-02','Umi no Sachi Shoten (仲卸)','intermediate',1,'N-2021-021',2000000,'active',null),
 ('a0000000-0000-0000-0000-000000000021','SBK-01','Nhà hàng Hamamichi (売買参加者)','participant',1,'P-2022-007',800000,'active',null),
 ('a0000000-0000-0000-0000-000000000022','SBK-02','Siêu thị Marine Mart (売買参加者)','participant',1,'P-2022-012',1500000,'suspended',null),
 ('a0000000-0000-0000-0000-000000000031','KAI-01','Quán sushi Tanaka (買出人)','retail',2,null,0,'active','a0000000-0000-0000-0000-000000000011'),
 ('a0000000-0000-0000-0000-000000000032','KAI-02','Izakaya Kaze (買出人)','retail',2,null,0,'active','a0000000-0000-0000-0000-000000000012');

insert into vessels (id, name, owner_name) values
 ('b0000000-0000-0000-0000-000000000001','第八さくら丸','Sato Gyogyo'),
 ('b0000000-0000-0000-0000-000000000002','海幸丸','Watanabe Suisan'),
 ('b0000000-0000-0000-0000-000000000003','大漁丸','Kobayashi Fisheries');

insert into fish_species (id, name_jp, name_vn, unit) values
 ('c0000000-0000-0000-0000-000000000001','マアジ','Cá nục bông','kg'),
 ('c0000000-0000-0000-0000-000000000002','マダイ','Cá tráp đỏ','kg'),
 ('c0000000-0000-0000-0000-000000000003','ブリ','Cá cam','kg'),
 ('c0000000-0000-0000-0000-000000000004','スルメイカ','Mực ống','kg'),
 ('c0000000-0000-0000-0000-000000000005','ヒラメ','Cá bơn','kg');

insert into arrivals (id, vessel_id, arrival_date, trade_form, note) values
 ('d0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001', current_date - 1, 'consignment','Cập cảng 04:20, báo qua điện thoại'),
 ('d0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002', current_date - 1, 'purchase','Fax lúc 03:50'),
 ('d0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003', current_date, 'consignment','Cập cảng 04:40');

insert into lots (id, lot_no, arrival_id, species_id, quantity, size_grade, freshness_rank, freshness_note, market_mark, channel, status) values
 ('e0000000-0000-0000-0000-000000000001','L-0001','d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',120.0,'M','A','Mắt trong, mang đỏ','◎','negotiation','sold'),
 ('e0000000-0000-0000-0000-000000000002','L-0002','d0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002',45.0,'L','S','Hàng đặc biệt','★','auction','sold'),
 ('e0000000-0000-0000-0000-000000000003','L-0003','d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000003',200.0,'L','A',null,'◎','negotiation','sold'),
 ('e0000000-0000-0000-0000-000000000004','L-0004','d0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000004',80.0,'M','B','Nên bán trong ngày','△','auction','available'),
 ('e0000000-0000-0000-0000-000000000005','L-0005','d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000005',30.0,'L',null,null,null,'pending','available'),
 ('e0000000-0000-0000-0000-000000000006','L-0006','d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000001',150.0,'S',null,null,null,'pending','available'),
 ('e0000000-0000-0000-0000-000000000007','L-0007','d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000002',60.0,'M','A','Còn sống khi cập cảng','◎','auction','available'),
 ('e0000000-0000-0000-0000-000000000008','L-0008','d0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',90.0,'M','B',null,'○','negotiation','available');

insert into auction_sessions (id, session_date, session_no, auctioneer_id, status) values
 ('f0000000-0000-0000-0000-000000000001', current_date - 1, 1, 'a0000000-0000-0000-0000-000000000002','closed'),
 ('f0000000-0000-0000-0000-000000000002', current_date, 1, 'a0000000-0000-0000-0000-000000000002','planned');
insert into auction_lots (session_id, lot_id, seq) values
 ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002',1),
 ('f0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000004',1),
 ('f0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000007',2);

-- Giao dịch kỳ trước (để có dữ liệu hóa đơn / thưởng)
insert into transactions (id, trade_type, lot_id, seller_id, buyer_id, session_id, unit_price, quantity, status, confirm_method, confirmed_by_name, confirmed_at, trade_date) values
 ('10000000-0000-0000-0000-000000000001','negotiation','e0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000011',null,850,120.0,'confirmed','app',null, now() - interval '1 day', current_date - 1),
 ('10000000-0000-0000-0000-000000000002','auction','e0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000021','f0000000-0000-0000-0000-000000000001',3200,45.0,'confirmed','verbal','Hamamichi-san', now() - interval '1 day', current_date - 1),
 ('10000000-0000-0000-0000-000000000003','negotiation','e0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000012',null,1100,200.0,'confirmed','verbal','Umi no Sachi – Suzuki', now() - interval '1 day', current_date - 1);

-- Hóa đơn tháng trước đã thanh toán (để demo thưởng thanh toán đúng hạn)
insert into invoices (id, invoice_no, buyer_id, period_start, period_end, subtotal, fee, incentive_deduction, total, due_date, paid_amount, paid_at, status) values
 ('20000000-0000-0000-0000-000000000001','INV-202609-001','a0000000-0000-0000-0000-000000000011', date_trunc('month', current_date - interval '1 month')::date, (date_trunc('month', current_date) - interval '1 day')::date, 1840000, 101200, 0, 1941200, (date_trunc('month', current_date) + interval '14 day')::date, 1941200, now() - interval '3 day', 'paid'),
 ('20000000-0000-0000-0000-000000000002','INV-202609-002','a0000000-0000-0000-0000-000000000021', date_trunc('month', current_date - interval '1 month')::date, (date_trunc('month', current_date) - interval '1 day')::date, 420000, 23100, 0, 443100, (date_trunc('month', current_date) + interval '14 day')::date, 200000, null, 'partial');
insert into payments (invoice_id, amount, paid_at) values
 ('20000000-0000-0000-0000-000000000001', 1941200, current_date - 3),
 ('20000000-0000-0000-0000-000000000002', 200000, current_date - 2);
