-- 行きたい場所リストのテーブル（Supabase MCP の apply_migration で適用したものと同じ）

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 20),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  category_id uuid references public.categories(id) on delete set null,
  address text,
  url text,
  memo text,
  visit_date date,
  visit_time time,
  visited boolean not null default false,
  created_by text not null,
  updated_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index places_category_id_idx on public.places (category_id);
create index places_visit_date_idx on public.places (visit_date) where visit_date is not null;

-- サーバー側（secret キー）からだけ読み書きする。ポリシーは作らない
alter table public.categories enable row level security;
alter table public.places enable row level security;

insert into public.categories (name, sort) values
  ('ごはん', 1), ('カフェ', 2), ('公園', 3), ('観光', 4);
