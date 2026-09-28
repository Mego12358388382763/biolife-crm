---
name: rls-audit
description: Audit BioLife CRM's Postgres Row Level Security policies, security-definer functions, grants and triggers against the three roles (admin, growth_operations, read_only). Use whenever a migration touches policies or tables, before a release, when the user asks "is this secure", "can X see/edit Y", "who can delete", or when a new table or Server Action is added — authorization in this app lives in the database, so any data change deserves this check.
---

# RLS audit

In this project the database is the security boundary; hidden buttons are cosmetic. The audit answers one question per table and operation: *what does each role actually get when calling Supabase directly with its own JWT?*

## Expected permission matrix

| | select | insert | update | soft delete (`deleted_at`) | hard delete |
|---|---|---|---|---|---|
| admin | yes | yes | yes | yes | yes |
| growth_operations | yes | yes | yes | **no** | **no** |
| read_only | yes | no | no | no | no |
| inactive profile | no | no | no | no | no |

Special cases: `profiles` (only admins change role/active/email; users edit their own name), `pipeline_stages` (config — admin writes only), `lead_stage_history` (append-only, nobody updates), `reset_crm_data()` (must check `is_admin()` inside the function).

## Procedure

1. List every table: `grep -n "create table" supabase/migrations/*.sql`.
2. For each table confirm `enable row level security` exists. A table without it is a critical finding.
3. Collect all policies for the table across all migrations (later migrations may drop/replace policies). Build the actual matrix and diff it against the expected one.
4. Check every `security definer` function: it must `set search_path = public`, and must check the caller's role itself if it writes data.
5. Check grants: `anon` should have nothing on CRM tables.
6. Look for `using (true)` on anything except profiles-select, and for `with check` missing on update policies (lets a writer move a row outside its allowed state).
7. Grep app code for `createAdminClient`/service role usage: it must only appear in `lib/supabase/admin.ts` and be called only after `requireAdmin()`.

## Report

Group findings as **Critical** (data exposed or writable by the wrong role), **High**, **Low**, each with file:line, the concrete attack ("a read_only user calling `supabase.from('leads').update(...)` from the browser console succeeds because…") and the fix as SQL for a new migration (see `supabase-migration`). If everything matches, say so plainly and show the matrix.

To prove findings rather than reason about them, use the `role-access-tests` skill.
