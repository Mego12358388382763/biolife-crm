---
name: supabase-migration
description: Write a new version-controlled Supabase/Postgres migration for BioLife CRM (tables, columns, enums, functions, triggers, indexes, RLS policies). Use this whenever a change needs any schema or database change — adding a field to leads/companies/tasks, a new table, a new report, a new policy, a Postgres function — even if the user only describes the feature ("add a source field", "track calls") and never says "migration".
---

# Supabase migration

The schema lives only in `supabase/migrations/`. Nobody edits the live database by hand, so every schema change is a new, append-only file. Never edit a migration that has already been committed — it may already have run in production; write a follow-up migration instead.

## Before writing

1. Read the existing migrations in order (`ls supabase/migrations`) — especially `*_initial_schema.sql` and `*_rls_policies.sql` — so you reuse the existing enums, helper functions (`is_admin()`, `can_write()`, `current_profile_active()`), and triggers (`protect_soft_delete`, `updated_at` handling).
2. Check `lib/data/*` and `types/database.ts` for code that will need to follow the change.

## File

`supabase/migrations/<YYYYMMDDHHMMSS>_<snake_case_summary>.sql` — the timestamp must sort after the latest existing file.

## Checklist for every new table

- `id uuid primary key default gen_random_uuid()`
- `created_at` / `updated_at timestamptz not null default now()` + the existing updated_at trigger
- `created_by uuid references profiles (id) on delete set null` when a user creates rows
- `deleted_at timestamptz` + index — soft delete is the default for business data
- Indexes on every foreign key and on columns used for filters/sorting
- `alter table ... enable row level security;`
- Policies following the house pattern:
  - select: `current_profile_active()`
  - insert/update: `can_write()` (admin + growth_operations)
  - delete: `is_admin()` only
  - attach the soft-delete guard trigger so only admins can set `deleted_at`
- Grants matching `*_grants.sql`
- If the table holds CRM operational data, decide explicitly whether `reset_crm_data()` must also clear it, and update that function in the same migration if so.

## Rules that matter here

- Pipeline stages are data (`pipeline_stages`). Never add a stage name into a check constraint, enum, or function body.
- Changing a column to NOT NULL needs a backfill first in the same migration.
- Destructive changes (drop column/table) need the user's explicit confirmation — they destroy history.
- Wrap multi-step changes so a failure leaves nothing half-applied (migrations run in a transaction by default in the Supabase CLI; don't add statements that can't run in one, like `create index concurrently`, without saying so).

## After writing

1. If a local stack is available: `npm run db:reset` to replay all migrations cleanly, then `npm run db:types`.
2. Update `types/database.ts`, the zod schema in `lib/validations/*`, and `lib/data/*` for the new shape.
3. Run the `rls-audit` skill on the new policies.
4. Summarise for the user: what changed, whether it is backward compatible, and anything that must happen on deploy.
