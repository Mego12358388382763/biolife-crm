---
name: lead-import-cleaner
description: Clean, normalize and deduplicate messy lead lists (Excel/CSV/pasted/WhatsApp exports/event sign-ups) into a file ready for BioLife CRM's CSV lead import — Egyptian phone numbers to +20 format, split names, fix emails, map columns, flag duplicates. Use whenever the user has a lead list to upload, says "naddaf el sheet", "3ayez a3mel import", or shares a spreadsheet of contacts.
---

# Lead import cleaner

BioLife CRM imports CSV leads and dedups by phone/email; garbage in means duplicates and unreachable leads. Use the `xlsx` skill for reading/writing spreadsheet files.

## Target columns

`first_name, last_name, job_title, company, email, phone, whatsapp, linkedin_url, country, city, source, temperature, notes` — if unsure of the current importer's columns, ask the user or check the CRM's import screen template.

## Cleaning rules

- **Names**: trim, collapse spaces, fix ALL CAPS, split full name into first/last (Arabic names: first token → first_name, rest → last_name). Keep Arabic as Arabic.
- **Egyptian phones**: strip spaces/dashes/brackets; convert Arabic-Indic digits (٠-٩) to 0-9; `01XXXXXXXXX` (11 digits) → `+201XXXXXXXXX`; `201…` → `+201…`; `00201…` → `+201…`. Valid mobile prefixes: 010, 011, 012, 015. Landlines (`02…`, `03…`) → `+202…`/`+203…`. Anything else → keep original, flag.
- If only one number exists, and it's a mobile, copy it to `whatsapp` too.
- **Emails**: lowercase, trim, flag invalid format and obvious typos (`gmial.com`, `hotmial.com`).
- **Duplicates**: same phone or same email (case-insensitive) → keep the most complete row, merge notes, list what was merged.
- **Source**: fill with where the list came from (event name, campaign) — ask if unknown.

## Output

1. Clean CSV (UTF-8 with BOM so Excel shows Arabic correctly).
2. A "needs review" sheet: invalid phones/emails, possible duplicates, missing names.
3. Summary: rows in → rows out, duplicates merged, rows flagged.
