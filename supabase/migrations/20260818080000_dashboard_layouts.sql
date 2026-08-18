create table if not exists public.dashboard_layouts (
  user_id text not null,
  viewport text not null check (viewport in ('mobile', 'desktop')),
  layout jsonb not null default '{"version":1,"cards":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint dashboard_layouts_pkey primary key (user_id, viewport),
  constraint dashboard_layouts_layout_object check (jsonb_typeof(layout) = 'object')
);

alter table public.dashboard_layouts enable row level security;

drop policy if exists dashboard_layouts_owner_all on public.dashboard_layouts;
create policy dashboard_layouts_owner_all
  on public.dashboard_layouts
  for all
  to authenticated
  using ((select auth.uid()::text) = user_id)
  with check ((select auth.uid()::text) = user_id);

grant select, insert, update, delete on table public.dashboard_layouts to authenticated;
revoke all on table public.dashboard_layouts from anon;
