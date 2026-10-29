-- =====================================================================
-- Sakura Bay Fish Market – prototype schema (LAB-2)
-- Chạy trong Supabase SQL Editor (hoặc `supabase db push`)
-- =====================================================================
create extension if not exists "pgcrypto";

-- Vai trò tham gia chợ & 2 cấp quyền mua
create type participant_role as enum ('admin','wholesaler','intermediate','participant','retail');
--  admin        = 市場管理者 (Ban quản lý chợ)
--  wholesaler   = 卸売業者   (Công ty bán buôn – bên bán)
--  intermediate = 仲卸       (Công ty trung gian – cấp 1)
--  participant  = 売買参加者 (Người mua được cấp phép – cấp 1)
--  retail       = 買出人     (Người mua lẻ – cấp 2, KHÔNG mua trực tiếp)

create table participants (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  role participant_role not null,
  tier smallint not null check (tier in (0,1,2)),      -- 0 = không mua (admin/wholesaler), 1 = mua trực tiếp, 2 = mua qua 仲卸
  license_no text,
  credit_limit numeric(12,0) not null default 0,       -- hạn mức giao dịch (JPY) theo 業務規程
  status text not null default 'active' check (status in ('active','suspended')),
  parent_intermediate_id uuid references participants(id),  -- 買出人 thuộc 仲卸 nào
  created_at timestamptz default now()
);

-- Tài khoản đăng nhập ↔ participant
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  participant_id uuid references participants(id),
  created_at timestamptz default now()
);

create table vessels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text not null
);

create table fish_species (
  id uuid primary key default gen_random_uuid(),
  name_jp text not null,
  name_vn text not null,
  unit text not null default 'kg'
);

-- 入荷 (nhập hàng từ tàu)
create table arrivals (
  id uuid primary key default gen_random_uuid(),
  vessel_id uuid not null references vessels(id),
  arrival_date date not null,
  trade_form text not null default 'consignment' check (trade_form in ('consignment','purchase')), -- 委託 / 買付
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Lot bán
create table lots (
  id uuid primary key default gen_random_uuid(),
  lot_no text unique not null,
  arrival_id uuid not null references arrivals(id) on delete cascade,
  species_id uuid not null references fish_species(id),
  quantity numeric(10,1) not null,
  size_grade text,                                    -- quy cách (規格)
  freshness_rank text check (freshness_rank in ('S','A','B','C')), -- 目利き – người chấm, hệ thống chỉ lưu
  freshness_note text,
  market_mark text,                                   -- 符丁 – ký hiệu riêng của chợ
  assessed_by uuid references profiles(id),
  assessed_at timestamptz,
  channel text not null default 'pending' check (channel in ('pending','negotiation','auction','held')), -- 振分
  status text not null default 'available' check (status in ('available','sold','withdrawn')),
  created_at timestamptz default now()
);

-- Phiên せり
create table auction_sessions (
  id uuid primary key default gen_random_uuid(),
  session_date date not null,
  session_no smallint not null default 1,
  auctioneer_id uuid references participants(id),
  status text not null default 'planned' check (status in ('planned','running','closed')),
  unique (session_date, session_no)
);

create table auction_lots (
  session_id uuid references auction_sessions(id) on delete cascade,
  lot_id uuid references lots(id),
  seq smallint not null,
  primary key (session_id, lot_id)
);

-- Giao dịch (cả 相対取引 và kết quả せり)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  trade_type text not null check (trade_type in ('negotiation','auction')),
  lot_id uuid not null references lots(id),
  seller_id uuid not null references participants(id),
  buyer_id uuid not null references participants(id),
  session_id uuid references auction_sessions(id),
  unit_price numeric(10,0) not null,
  quantity numeric(10,1) not null,
  amount numeric(12,0) generated always as (round(unit_price * quantity)) stored,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  confirm_method text check (confirm_method in ('app','verbal')),
  confirmed_by_name text,
  confirmed_at timestamptz,
  invoice_id uuid,
  trade_date date not null default current_date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Tham số 業務規程 (đơn giản hóa: 1 version)
create table market_rules (
  key text primary key,
  value numeric not null,
  description text
);

-- 請求書
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null,
  buyer_id uuid not null references participants(id),
  period_start date not null,
  period_end date not null,
  subtotal numeric(12,0) not null,
  fee numeric(12,0) not null default 0,              -- 手数料
  incentive_deduction numeric(12,0) not null default 0, -- 奨励金 kỳ trước trừ vào
  total numeric(12,0) not null,
  due_date date not null,
  paid_amount numeric(12,0) not null default 0,
  paid_at timestamptz,
  status text not null default 'unpaid' check (status in ('unpaid','partial','paid')),
  created_at timestamptz default now()
);
alter table transactions add constraint transactions_invoice_fk foreign key (invoice_id) references invoices(id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id),
  amount numeric(12,0) not null,
  paid_at date not null,
  method text default 'bank_transfer',
  created_at timestamptz default now()
);

-- 完納奨励金
create table incentives (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references participants(id),
  period_start date not null,
  period_end date not null,
  base_amount numeric(12,0) not null,
  rate numeric(6,4) not null,
  amount numeric(12,0) not null,
  status text not null default 'calculated' check (status in ('calculated','approved','applied')),
  approved_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (buyer_id, period_start)
);

-- ---------- Row Level Security (prototype: mọi user đã đăng nhập đọc được; ghi qua API route với service role) ----------
alter table participants enable row level security;
alter table profiles enable row level security;
alter table vessels enable row level security;
alter table fish_species enable row level security;
alter table arrivals enable row level security;
alter table lots enable row level security;
alter table auction_sessions enable row level security;
alter table auction_lots enable row level security;
alter table transactions enable row level security;
alter table market_rules enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table incentives enable row level security;

do $$
declare t text;
begin
  foreach t in array array['participants','profiles','vessels','fish_species','arrivals','lots','auction_sessions','auction_lots','transactions','market_rules','invoices','payments','incentives'] loop
    execute format('create policy "read for authenticated" on %I for select to authenticated using (true);', t);
  end loop;
end $$;

-- Views tiện cho màn hình
create view v_lots as
select l.*, s.name_jp as species_jp, s.name_vn as species_vn, a.arrival_date, v.name as vessel_name
from lots l join fish_species s on s.id = l.species_id join arrivals a on a.id = l.arrival_id join vessels v on v.id = a.vessel_id;

create view v_transactions as
select t.*, l.lot_no, s.name_vn as species_vn, s.name_jp as species_jp, b.name as buyer_name, b.role as buyer_role, b.tier as buyer_tier, se.name as seller_name
from transactions t join lots l on l.id = t.lot_id join fish_species s on s.id = l.species_id
join participants b on b.id = t.buyer_id join participants se on se.id = t.seller_id;

grant select on v_lots, v_transactions to authenticated;
