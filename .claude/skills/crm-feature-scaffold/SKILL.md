---
name: crm-feature-scaffold
description: Build a complete new feature or entity in BioLife CRM end-to-end following the house architecture — migration, types, zod validation, server-only data layer, Server Actions with role checks, shadcn components and App Router pages. Use when the user asks to add a new module, screen, entity or workflow (e.g. "add deals", "add a call log", "add products", "add an activities tab to leads").
---

# CRM feature scaffold

Every feature in this codebase has the same layers. Follow the existing `leads` feature as the reference implementation — read it before writing anything:

- `supabase/migrations/*` → schema + RLS
- `types/database.ts` → row types
- `lib/validations/lead.ts` → zod schema (reuse `idSchema` from `lib/validations/shared.ts` for IDs)
- `lib/data/leads.ts` → `import "server-only"`, one function per operation, filters `deleted_at is null`, throws on error
- `app/(app)/leads/actions.ts` → `"use server"`, `requireProfile()` / `canWrite()` / `requireAdmin()`, `safeParse`, call data layer, `revalidatePath`
- `components/leads/*` → forms/tables using `components/ui/*` primitives
- `app/(app)/leads/page.tsx`, `[id]/`, `new/` → thin pages that call the data layer

## Order of work

1. Confirm the fields, who can do what (roles), and where it appears in the nav. Ask only what you can't infer.
2. Migration via the `supabase-migration` skill (soft delete, RLS, indexes).
3. Types → validation → data layer → actions → components → pages → nav entry in `components/shell/*`.
4. Next.js 16 rules: `params`/`searchParams` are Promises (`const { id } = await params`), `cookies()`/`headers()` are async, route protection is in `proxy.ts`. Check `node_modules/next/dist/docs/` when unsure.
5. Stage-related logic joins `pipeline_stages` — never hardcode stage names.
6. Hard delete only for admins and only behind a confirmation dialog (see `components/leads/delete-lead-button.tsx`).

## Done means

- `npx tsc --noEmit`, `npm run lint`, `npm run build` pass (the `preflight` skill).
- `rls-audit` has checked the new policies.
- Existing features still work — nothing outside the feature was changed without reason.
- A short summary for the user listing files added/changed and how to try it.
