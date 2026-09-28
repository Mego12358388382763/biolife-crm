---
name: preflight
description: Run BioLife CRM's full pre-push quality gate — typecheck, lint, production build, and any tests — and fix what fails before committing or pushing. Use before every commit/push/PR, after finishing any code change, and whenever the user says "check everything", "is it ready", "make sure nothing broke".
---

# Preflight

A broken build on this internal operating system costs the team real working time, so nothing gets pushed without passing these.

## Steps (run from repo root, stop and fix at the first failure)

1. `npm ci` only if `node_modules` is missing.
2. `npx tsc --noEmit` — strict mode; fix types, don't add `any` or `@ts-ignore` to silence them.
3. `npm run lint`
4. `npm run build` — catches Next.js 16 convention errors and server/client boundary mistakes. The build may need `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; if missing, use obvious placeholders for the build only and say so.
5. Tests if present: `supabase/tests` (see `role-access-tests`), `npm run test:e2e` (see `e2e-flows`).
6. `git diff --stat` and re-read the diff: unrelated changes, debug logs, commented-out code, secrets (see `secrets-guard`).
7. If `AGENTS.md` was modified by `next dev`, that change is expected and fine to commit.

## Report

A short table: check → pass/fail → note. If something could not run in this environment, mark it "not run" with the reason — never mark it passed.
