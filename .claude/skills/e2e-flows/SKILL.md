---
name: e2e-flows
description: Create and run Playwright end-to-end tests for BioLife CRM's critical user journeys — login, create/edit lead, CSV import, move lead through pipeline, tasks, role restrictions, admin data management. Use when the user wants to verify the app actually works in a browser, before a release, after a risky change, or asks for "e2e", "browser tests", or "test the whole flow".
---

# End-to-end flows

## Setup (first time)

1. `npm i -D @playwright/test` — do **not** run `playwright install` in the cloud environment; Chromium is preinstalled (`PLAYWRIGHT_BROWSERS_PATH`). If versions mismatch, use `executablePath: '/opt/pw-browsers/chromium'` in `playwright.config.ts`.
2. Tests in `e2e/`, config `playwright.config.ts` with `webServer: { command: 'npm run dev', url: 'http://localhost:3000' }`. Add `"test:e2e": "playwright test"` to package.json.
3. Test accounts: create them at runtime in the **local** Supabase via the admin API using env vars (`E2E_ADMIN_EMAIL`, etc.) and generated passwords. Never commit credentials, never point e2e at production.

## Journeys to cover

1. Unauthenticated user visiting `/leads` is redirected to `/login`.
2. growth_operations: login → create lead → appears in list → edit → move stage on `/pipeline` → stage history entry recorded.
3. CSV import: upload a small fixture CSV (with a duplicate phone) → preview → import → duplicate reported.
4. Task: create → complete.
5. read_only: sees leads, has no create/edit controls, and a direct Server Action call fails.
6. admin: Settings → Data Management reset requires typing `DELETE ALL DATA` exactly (test the confirm button stays disabled otherwise; run the actual reset only against local data).

Prefer role/label locators (`getByRole`, `getByLabel`) over CSS selectors so tests survive styling changes.

## Run & report

`npx playwright test` — report pass/fail per journey, and attach the trace/screenshot path for failures. If the local database can't be started here, say so and don't report the suite as passing.
