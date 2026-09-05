-- Persist the break deduction selected for each shift.
-- Existing rows keep the previous one-hour default.
alter table public.work_logs
  add column if not exists break_hours numeric(4, 2) not null default 1
  check (break_hours >= 0 and break_hours <= 24);
