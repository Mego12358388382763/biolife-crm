---
name: role-access-tests
description: Write and run SQL tests that prove BioLife CRM's role permissions by impersonating admin, growth_operations, read_only and inactive users against the local Supabase database. Use after any migration or policy change, when verifying an RLS fix, or when the user asks to "test permissions", "make sure read-only can't edit", or "prove the reset is admin-only".
---

# Role access tests

Reasoning about RLS is error-prone; running queries as each role is proof. Tests live in `supabase/tests/` as plain SQL (pgTAP if the Supabase CLI's `supabase test db` is available, otherwise plain SQL with `do $$ ... assert ... $$`).

## How impersonation works

Inside a transaction that is always rolled back:

```sql
begin;
-- fixture users (inserted as postgres, bypassing RLS)
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'admin@test.local');
-- handle_new_user() creates the profile; then set its role:
update profiles set role = 'admin', active = true where id = '00000000-0000-0000-0000-00000000000a';

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
-- queries here run under RLS as that user
reset role;
rollback;
```

Check the `handle_new_user()` trigger in the migrations first — adapt fixture inserts to the columns it needs. Never use real emails or passwords; fixtures are throwaway and rolled back.

## Minimum coverage

For each of leads, companies, tasks, pipeline_stages, profiles, lead_stage_history, and reporting tables:
- read_only: select works; insert/update/delete affect 0 rows or raise.
- growth_operations: insert/update work; setting `deleted_at` raises; hard delete affects 0 rows.
- admin: everything works.
- inactive user: select returns 0 rows.
Plus: non-admin calling `reset_crm_data()` raises; non-admin cannot change their own `role`.

Note that RLS-filtered update/delete silently affects 0 rows instead of erroring — assert on row counts (`get diagnostics` / `returning`) not just on "no error".

## Run

`supabase start` then `supabase test db` (pgTAP) or `psql "$DB_URL" -f supabase/tests/<file>.sql`. If no local database can be started in this environment, say so explicitly and hand the user the exact command — do not claim the tests passed.
