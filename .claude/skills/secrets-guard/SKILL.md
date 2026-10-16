---
name: secrets-guard
description: Scan BioLife CRM changes and history for committed secrets, credentials, service-role keys, passwords, demo accounts, or personal data before commit/push, and check that SUPABASE_SERVICE_ROLE_KEY stays server-only. Use before any push, when adding env vars, seed data, fixtures, test accounts, or integrations (n8n, Gmail, WhatsApp, Claude API keys).
---

# Secrets guard

Project rule: no credentials of any kind ever enter the repo, and the service-role key is read only in `lib/supabase/admin.ts`.

## Checks

1. Staged/changed content:
   ```bash
   git diff --cached; git diff
   grep -rnE "(eyJ[a-zA-Z0-9_-]{20,}\.|sk-[a-zA-Z0-9]{20,}|sk-ant-|service_role|SUPABASE_SERVICE_ROLE_KEY\s*=|password\s*[:=]\s*['\"][^'\"]+|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,})" --exclude-dir=node_modules --exclude-dir=.next .
   ```
2. Service role usage: `grep -rn "SERVICE_ROLE" --exclude-dir=node_modules .` → only `lib/supabase/admin.ts` (and docs). Never behind `NEXT_PUBLIC_`.
3. `NEXT_PUBLIC_*` vars contain nothing secret (they ship to the browser).
4. `.env*` files are gitignored and not tracked: `git ls-files | grep -i env`.
5. `supabase/seed.sql` creates no accounts or operational data.
6. Fixtures/tests contain no real customer names, phones, or emails — use `@test.local` / `example.com` and fake numbers.

## If something is found

Stop, don't push. Remove it, and tell the user plainly that a secret that was ever pushed must be **rotated** (removing it from the latest commit doesn't remove it from history). Point them to where to rotate (Supabase dashboard → API keys, etc.).
