---
name: supabase-types-sync
description: Regenerate and reconcile BioLife CRM's TypeScript database types after schema changes (types/database.generated.ts via npm run db:types, plus the hand-written types/database.ts), and fix resulting type errors. Use right after any migration, when TypeScript complains about unknown columns or tables, or when the user says types are out of date.
---

# Supabase types sync

`types/database.generated.ts` is generated; `types/database.ts` holds the app's hand-written row types (e.g. `Profile`). Both must match the migrations.

1. With the local stack running (`npm run db:start`, then `npm run db:reset` to apply migrations): `npm run db:types`.
2. If the local stack can't run here, update `types/database.generated.ts` by hand only as a last resort, mirroring the migration exactly, and tell the user to regenerate it locally.
3. Update `types/database.ts` to reflect new/changed columns (nullability matters — e.g. lead names are nullable since `*_nullable_lead_names.sql`).
4. `npx tsc --noEmit` and fix every error at the source (data layer, validations, components) — don't cast around them.
5. Never hand-edit the generated file and the migration differently; the migration wins.
