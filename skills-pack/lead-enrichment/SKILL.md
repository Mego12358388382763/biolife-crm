---
name: lead-enrichment
description: Fill in missing lead/company data for BioLife CRM (job title, company, email, phone/WhatsApp, LinkedIn, city, industry, size) using Apollo or Vibe Prospecting, with credit cost shown first. Use when the user has a list of names/companies with gaps, a CSV to enrich before import, or asks "kammel el data", "hatli el emails", "enrich".
---

# Lead enrichment

1. **Inspect input** — how many rows, which fields exist, which are missing. Tell the user.
2. **Estimate cost first.** Use Vibe Prospecting `estimate-cost` or the Apollo `mcp_credits` estimate; show the number of credits and ask to proceed if it's more than trivial. Credits are real money.
3. **Match then enrich**: match people/companies (`apollo_people_bulk_match` / `match-prospects`, `apollo_organizations_bulk_enrich` / `match-business`), then enrich only what's missing. Batch rather than calling per row.
4. **Confidence**: keep a `match_confidence` column (high/medium/low). Low-confidence matches are flagged, not silently merged.
5. **Normalize** to CRM import format (see `lead-import-cleaner`): phones in E.164 (`+20…` for Egypt), lowercase emails, trimmed names, country/city spelled consistently.
6. **Output** a CSV ready for BioLife CRM's CSV import plus a short summary: rows enriched, fields filled, rows not found, credits used and remaining balance.

Only enrich business contact data for legitimate B2B outreach; don't hunt for personal/home details.
