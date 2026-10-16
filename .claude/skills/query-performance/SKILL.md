---
name: query-performance
description: Find and fix slow pages and queries in BioLife CRM — missing indexes, N+1 Supabase calls, over-fetching selects, heavy reports, unnecessary client components. Use when the user says a page is slow, when lead/company counts grow, when adding reports or dashboards, or before importing large CSVs.
---

# Query performance

## Investigate

1. Identify the slow page and list every Supabase call it makes (page → `lib/data/*`). Look for calls inside loops or `Promise.all` over rows (N+1) — replace with one query using embedded selects or `.in()`.
2. Check `select(...)`: fetch only needed columns for list views; embeds (`companies(name)`) are fine but avoid pulling notes/long text into tables.
3. Filters/sorts vs indexes: every column in `.eq/.order/.ilike` on big tables should be indexed. `ilike '%x%'` can't use a btree — suggest `pg_trgm` GIN indexes for search.
4. `deleted_at is null` appears in most queries — consider partial indexes `where deleted_at is null` for hot paths.
5. Reports (`lib/reporting.ts`, `lib/data/performance.ts`): aggregate in Postgres (a view or SQL function with `security invoker`) instead of fetching all rows and counting in JS.
6. Pagination: lists should use `.range()` rather than loading everything.
7. With a local DB: `explain analyze` the SQL equivalent.

## Fix

Indexes and SQL functions go through `supabase-migration`. Measure before/after (timing or `explain analyze`) and report the numbers — don't claim a speedup you didn't measure.
