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
- Never expose service-role credentials to the client or commit them to source control.
- Database migrations are version controlled under `supabase/migrations/` — never edit the schema by hand against a live database.
- Validate all external input with `zod` schemas in `lib/validations/*` before it reaches a data-access function.
- Preserve existing working functionality — this is an internal operating system; regressions cost the business real time.
- Test changes (auth, RLS, CRUD flows) before considering a task complete.
- Soft deletion (`deleted_at`) is the default; avoid hard deletes and unnecessary cascade deletes. CRM historical data should generally be preserved.
- Pipeline stages are database-driven (`pipeline_stages` table) — never hardcode stage names or stage logic in application code.

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
  supabase/                Server + browser Supabase clients
  auth/                    Session/role helpers (DAL)
  validations/             zod schemas per entity
  data/                    Server-only data-access functions (business logic)
supabase/
  migrations/              Version-controlled SQL
  seed.sql                 Development seed data
proxy.ts                   Route protection (Next.js 16 — replaces middleware.ts)
```

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
