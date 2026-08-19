@AGENTS.md

# BioLife CRM

## Project

BioLife CRM

## Purpose

Internal sales, lead generation and business development operating system for BioLife Health Ltd.

## Technology

- Next.js (App Router)
- TypeScript (strict mode)
- Supabase (Auth + Postgres)
- PostgreSQL
- Tailwind CSS
- shadcn/ui

## Coding Principles

- TypeScript strict mode.
- Modular architecture — business logic lives in `lib/data/*` (server-only), never inline in page files.
- Reusable components in `components/*`.
- Server-side security — authorization is enforced in Postgres Row Level Security, not just hidden UI.
- Never expose service-role credentials to the client or commit them to source control. `SUPABASE_SERVICE_ROLE_KEY` is server-only (no `NEXT_PUBLIC_` prefix) and is only ever read inside `lib/supabase/admin.ts`, which is only called from Server Actions already gated by `requireAdmin()`.
- Database migrations are version controlled under `supabase/migrations/` — never edit the schema by hand against a live database.
- Validate all external input with `zod` schemas in `lib/validations/*` before it reaches a data-access function.
- Preserve existing working functionality — this is an internal operating system; regressions cost the business real time.
- Test changes (auth, RLS, CRUD flows) before considering a task complete.
- Soft deletion (`deleted_at`) is the default for edits made in the normal course of work; edits/updates should never silently destroy history. Hard deletion exists but is intentionally narrow: individual/bulk record deletion and the full data reset (Settings → Data Management) are Admin-only, enforced at the database level (RLS delete policies + the `is_admin()` check inside `reset_crm_data()`), not just a hidden UI button, and always require an explicit confirmation step in the UI.
- Pipeline stages are database-driven (`pipeline_stages` table) — never hardcode stage names or stage logic in application code.
- No login credentials — demo, shared, or otherwise — are ever committed to this repository. `supabase/seed.sql` seeds no accounts and no operational data; every account (local or production) is provisioned through Supabase Auth with a generated password, never a hardcoded one.

## Roles

- `admin` — full CRM access, user management, system configuration.
- `growth_operations` — create/edit leads, create companies, manage pipeline, create/complete tasks, add notes. Cannot manage system-level permissions, change critical configuration, or permanently delete protected CRM data.
- `read_only` — view permitted data only.

## Project Structure

```
app/
  (auth)/login/            Public login route
  (app)/                   Protected route group (dashboard, leads, companies, pipeline, tasks, settings)
components/
  ui/                      shadcn primitives
  shell/                   Sidebar, header, nav
  leads/ companies/ pipeline/ tasks/   Feature components
lib/
  supabase/                Server + browser Supabase clients, plus admin.ts (service-role, admin-gated)
  auth/                    Session/role helpers (DAL)
  validations/             zod schemas per entity
  data/                    Server-only data-access functions (business logic)
supabase/
  migrations/              Version-controlled SQL
  seed.sql                 Local dev notes only — no accounts, no operational data
proxy.ts                   Route protection (Next.js 16 — replaces middleware.ts)
```

## Settings → Data Management & QR Access

- **Create team account** (Settings): creates a real Supabase Auth user via the service-role admin API, with a randomly generated password shown once and never persisted or logged.
- **Reset CRM Data** (Settings → Data Management, admin-only): two-step confirmation (warning → type `DELETE ALL DATA` exactly) before calling the `reset_crm_data()` Postgres function, which atomically deletes `leads`, `companies`, `tasks`, and `lead_stage_history` while preserving `profiles`, `pipeline_stages`, and all schema/config.
- **QR Access** (Settings): client-side-generated QR code (via the `qrcode` package, no external network call) encoding only the CRM login URL — never a token, password, or user data.

## Future Integrations (documented, NOT implemented in Phase 1)

- n8n
- Scrapling
- Claude API
- Gmail
- WhatsApp
- Calendar
- LinkedIn workflows
- Website lead forms

## Next.js Version Note

This project runs Next.js 16. Conventions differ from older training data — most notably `middleware.ts` is renamed `proxy.ts` (exported function name `proxy`), and `params`/`searchParams`/`cookies()`/`headers()` are async-only. Check `node_modules/next/dist/docs/` before assuming an older API surface.
