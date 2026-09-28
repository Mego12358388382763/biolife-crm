---
name: dedupe-merge
description: Find duplicate or near-duplicate leads and companies in BioLife CRM data (same phone, email, similar names, Arabic/English spelling variants, company name variants) and produce a safe merge plan. Use when the user suspects duplicates, after big imports, before campaigns, or says "fi leads mtkarara".
---

# Dedupe & merge

## Detect (from a CRM export or query results)

Strong matches (almost surely the same): identical normalized phone (E.164), identical lowercase email.
Probable: same name + same company; same LinkedIn URL.
Possible: fuzzy name match (Arabic ↔ English transliteration like "Mohamed/Mohammed/محمد", "Ahmed/Ahmad/أحمد"), company variants ("BioLife Clinic", "Bio Life Clinics LLC", "بيولايف").

Normalize before comparing: strip titles (Dr., د.), punctuation, legal suffixes (LLC, Ltd, شركة), unify Arabic letters (أ/إ/آ→ا, ة→ه, ى→ي).

## Merge plan

For each group: which record survives (the one with most history: stage, tasks, notes — not just most fields), which fields to take from the others, notes to append.

## Safety

The CRM keeps history; merging in the app should soft-delete the losers (`deleted_at`) after moving tasks/notes to the survivor — only an admin can do that. Present the plan as a table for approval; never delete anything based on a "possible" match without the user confirming.
