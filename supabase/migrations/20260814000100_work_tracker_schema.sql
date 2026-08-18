-- Work Tracker schema for the original google-sheet-organizer app.
-- User ownership uses text IDs because the app also supports local guest sessions.
-- Guest sessions remain local-only; authenticated Supabase users are protected by RLS.

create table if not exists public.user_settings (
  user_id text primary key,
  theme text not null default 'light' check (theme in ('light', 'dark', 'system')),
  background_color text,
  card_color text,
  foreground_color text,
  border_color text,
  primary_color text,
  secondary_color text,
  accent_color text,
  success_color text,
  warning_color text,
  destructive_color text,
  chart_colors jsonb not null default '[]'::jsonb,
  daily_rate numeric(12, 2) not null default 500,
  default_ot_type numeric(3, 1) not null default 0 check (default_ot_type in (0, 1.5, 2, 3)),
  travel_cost numeric(12, 2) not null default 0,
  food_cost numeric(12, 2) not null default 0,
  other_income numeric(12, 2) not null default 0,
  other_deductions numeric(12, 2) not null default 0,
  spreadsheet_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.work_types (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null check (char_length(trim(name)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists work_types_user_name_unique
  on public.work_types (user_id, lower(trim(name)));

create table if not exists public.ot_types (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  name text not null,
  multiplier numeric(3, 1) not null check (multiplier in (0, 1.5, 2, 3)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ot_types_user_multiplier_unique
  on public.ot_types (coalesce(user_id, ''), multiplier);

insert into public.ot_types (user_id, name, multiplier)
values
  (null, 'ไม่มี OT', 0),
  (null, 'OT 1.5 เท่า (วันทำงานปกติ)', 1.5),
  (null, 'OT 2.0 เท่า (วันหยุดทำงาน)', 2),
  (null, 'OT 3.0 เท่า (วันหยุดนักขัตฤกษ์)', 3)
on conflict do nothing;

create table if not exists public.work_logs (
  id text primary key,
  user_id text not null,
  date date not null,
  check_in_time timestamptz not null,
  check_out_time timestamptz,
  work_type text not null,
  location_name text not null default '',
  check_in_gps jsonb,
  check_out_gps jsonb,
  check_in_photo text,
  check_out_photo text,
  gross_hours numeric(8, 2) not null default 0,
  working_hours numeric(8, 2) not null default 0,
  ot_hours numeric(8, 2) not null default 0,
  ot_type numeric(3, 1) not null default 0 check (ot_type in (0, 1.5, 2, 3)),
  daily_rate numeric(12, 2) not null default 0,
  base_wage numeric(12, 2) not null default 0,
  ot_income numeric(12, 2) not null default 0,
  travel_cost numeric(12, 2) not null default 0,
  food_cost numeric(12, 2) not null default 0,
  other_income numeric(12, 2) not null default 0,
  other_deductions numeric(12, 2) not null default 0,
  net_income numeric(12, 2) not null default 0,
  tasks jsonb not null default '[]'::jsonb,
  airtable_record_id text,
  airtable_synced_at timestamptz,
  sync_status text not null default 'pending' check (sync_status in ('synced', 'failed', 'pending')),
  synced_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null check (char_length(trim(name)) > 0),
  code text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists branches_user_name_unique
  on public.branches (user_id, lower(trim(name)));

create table if not exists public.branch_settings (
  branch_id uuid primary key references public.branches(id) on delete cascade,
  user_id text not null,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;
alter table public.work_types enable row level security;
alter table public.ot_types enable row level security;
alter table public.work_logs enable row level security;
alter table public.branches enable row level security;
alter table public.branch_settings enable row level security;

drop policy if exists user_settings_owner_all on public.user_settings;
create policy user_settings_owner_all on public.user_settings
  for all to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

drop policy if exists work_types_owner_all on public.work_types;
create policy work_types_owner_all on public.work_types
  for all to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

drop policy if exists ot_types_read_available on public.ot_types;
create policy ot_types_read_available on public.ot_types
  for select to authenticated
  using (user_id is null or (select auth.uid())::text = user_id);

drop policy if exists ot_types_owner_insert on public.ot_types;
create policy ot_types_owner_insert on public.ot_types
  for insert to authenticated
  with check ((select auth.uid())::text = user_id);

drop policy if exists ot_types_owner_update on public.ot_types;
create policy ot_types_owner_update on public.ot_types
  for update to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

drop policy if exists ot_types_owner_delete on public.ot_types;
create policy ot_types_owner_delete on public.ot_types
  for delete to authenticated
  using ((select auth.uid())::text = user_id);

 drop policy if exists work_logs_owner_all on public.work_logs;
create policy work_logs_owner_all on public.work_logs
  for all to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

drop policy if exists branches_owner_all on public.branches;
create policy branches_owner_all on public.branches
  for all to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

drop policy if exists branch_settings_owner_all on public.branch_settings;
create policy branch_settings_owner_all on public.branch_settings
  for all to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update, delete on public.work_types to authenticated;
grant select, insert, update, delete on public.ot_types to authenticated;
grant select, insert, update, delete on public.work_logs to authenticated;
grant select, insert, update, delete on public.branches to authenticated;
grant select, insert, update, delete on public.branch_settings to authenticated;
