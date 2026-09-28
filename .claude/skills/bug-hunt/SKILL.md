---
name: bug-hunt
description: Systematically reproduce, root-cause and fix a bug in BioLife CRM, then add a regression check. Use whenever the user reports something broken, an error message, a screenshot of a failure, wrong numbers in reports, a failed import, a login/permission problem, or says "mesh sha3'al" / "fi moshkela" — even if vague.
---

# Bug hunt

Guessing and patching symptoms causes regressions in an app the team runs their day on. Work in this order:

1. **Restate** the bug in one sentence: who (role), where (page/action), what they did, what they expected, what happened. Ask for the missing piece only if you truly can't infer it.
2. **Reproduce** — locally with the `run` skill, a SQL query, or a minimal script. If it can't be reproduced, collect evidence (logs, the exact input, role) before changing code.
3. **Locate** — trace the path: page → component → Server Action → `lib/data/*` → Postgres (RLS policies, triggers, functions). Many "it doesn't save" bugs are RLS silently filtering an update to 0 rows, or a zod schema rejecting a field the UI thinks is optional.
4. **Root cause** — explain *why* it happens, in one paragraph. "Flaky" or "weird" is not a cause.
5. **Fix** at the root, minimally. Don't refactor unrelated code in the same change.
6. **Guard** — add a regression check (SQL test, e2e step, or zod test) where the project has somewhere to put it.
7. **Verify** with `preflight`, and re-run the original reproduction.

Report: cause, fix (files), how it was verified, and anything the user should do (e.g. a migration to apply).
