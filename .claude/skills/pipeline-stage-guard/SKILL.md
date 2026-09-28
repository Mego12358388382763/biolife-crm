---
name: pipeline-stage-guard
description: Find and remove hardcoded pipeline stage names or stage logic in BioLife CRM code and make it data-driven from the pipeline_stages table. Use when touching pipeline, reports, dashboards, lead scoring, or anything that says "won", "lost", "qualified", "proposal", "new lead" etc., and before merging pipeline-related changes.
---

# Pipeline stage guard

Stages are managed as rows in `pipeline_stages` (name, position, active). If code says `if (stage.name === "Won")`, renaming the stage in Settings silently breaks reports and automations. So stage meaning must come from data.

## Find

```bash
grep -rniE "\"(new|contacted|qualified|proposal|negotiation|won|lost|closed)[^\"]*\"" app components lib --include=*.ts --include=*.tsx
grep -rniE "stage(_name|\.name)\s*===" app components lib
grep -rniE "'(won|lost)'" supabase/migrations
```

Review each hit — a UI placeholder string is fine; a comparison, filter, count, or color map keyed on a stage name is not.

## Fix patterns

- Order/progress → use `position`.
- Need to know "is this a closed/won stage"? → propose a migration adding a data column (e.g. `kind text check (kind in ('open','won','lost'))` or `is_won boolean`) that admins set in Settings, then query by that column.
- Colors/labels per stage → derive from position or store in the table, not a name-keyed map.
- Queries → join `pipeline_stages` by id; never filter on name.

Report every hit, what you changed, and any migration needed (via `supabase-migration`).
