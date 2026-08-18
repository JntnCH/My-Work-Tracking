# Live Supabase schema findings

The original `google-sheet-organizer` is configured to use the Supabase project named `Work-Tracking`, project reference `idxioootfnninrejvspi`, in region `ap-southeast-1`.

Before this task, the project had no public tables and no migration history. The `work_tracker_schema` migration was applied successfully on 2026-08-14 and created `user_settings`, `work_types`, `ot_types`, `work_logs`, `branches`, and `branch_settings` with authenticated-user RLS policies. It also seeded the four standard OT options, including `ไม่มี OT` with multiplier `0`.

The generated live TypeScript schema confirms these tables and columns. `user_settings.chart_colors` and `work_logs.tasks` are JSONB values. `work_types` is owned by a text `user_id`, and work-type names have a per-user case-insensitive unique index. Global `ot_types` rows have a null `user_id` and are readable by authenticated users; user-specific OT rows are owned by their user.

The schema migration was performed through the Supabase migration API and returned `{ "success": true }`. No user work-log data existed in the live project before the migration because the public table list was empty.
