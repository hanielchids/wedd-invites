-- ============================================================
-- Photowall (/photobooth) — run this in the Supabase SQL editor
-- Writes go through the Next.js API with the service-role key;
-- anon key only ever reads. Storage bucket "photos" is public-read.
-- ============================================================

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  device_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete set null,
  storage_key text not null unique,
  kind text not null default 'photo' check (kind in ('photo','video')),
  width int,
  height int,
  status text not null default 'ready' check (status in ('pending','ready','hidden')),
  created_at timestamptz not null default now()
);

create index if not exists uploads_status_created_idx on uploads (status, created_at desc);

create table if not exists reactions (
  upload_id uuid not null references uploads(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  primary key (upload_id, device_id)
);

-- Public-read storage bucket for the photos themselves
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- RLS: lock everything down; the service-role API bypasses these.
alter table guests enable row level security;
alter table uploads enable row level security;
alter table reactions enable row level security;

drop policy if exists "anon reads ready uploads" on uploads;
create policy "anon reads ready uploads"
  on uploads for select
  using (status = 'ready');

drop policy if exists "anon reads reactions" on reactions;
create policy "anon reads reactions"
  on reactions for select
  using (true);

-- guests table: no anon policies (names are exposed via the API join only)
