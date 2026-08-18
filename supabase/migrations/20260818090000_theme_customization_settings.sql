-- Persist advanced theme customization without changing existing work-log or payroll fields.
-- Existing users keep the current Google Material defaults when these columns are null.
alter table public.user_settings
  add column if not exists preset_name text,
  add column if not exists border_radius text not null default 'normal',
  add column if not exists button_style text not null default 'filled',
  add column if not exists density text not null default 'normal';

alter table public.user_settings
  drop constraint if exists user_settings_border_radius_check;
alter table public.user_settings
  add constraint user_settings_border_radius_check
  check (border_radius in ('sharp', 'compact', 'normal', 'smooth', 'pill'));

alter table public.user_settings
  drop constraint if exists user_settings_button_style_check;
alter table public.user_settings
  add constraint user_settings_button_style_check
  check (button_style in ('filled', 'outlined', 'tonal', 'elevated'));

alter table public.user_settings
  drop constraint if exists user_settings_density_check;
alter table public.user_settings
  add constraint user_settings_density_check
  check (density in ('compact', 'normal', 'comfortable'));
