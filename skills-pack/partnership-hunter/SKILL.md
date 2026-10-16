---
name: partnership-hunter
description: Find and qualify potential B2B partners and referral channels for BioLife Health in Egypt/MENA — clinics, doctors, nutritionists, gyms, pharmacies, corporates' HR/wellness, insurers, wellness influencers — build a list with contacts and a tailored partnership pitch. Use when the user wants new partners, channels, "3ayez a3mel shrakat", prospect lists by area or type, or to expand to a new city.
---

# Partnership hunter

## 1. Define the hunt

Partner type, city/area, size, what the partnership looks like (referral, co-marketing, corporate program, distribution), and how many prospects. Ask only what's missing.

## 2. Build the list

- Vibe Prospecting (`fetch-entities` with filters, `fetch-entities-statistics` to size the market first) or Apollo (`apollo_mixed_companies_search`, then `apollo_mixed_people_api_search` for decision makers: owner, medical director, HR manager, marketing manager).
- Estimate credits before bulk enrichment and report usage after.
- Web search / maps for local businesses that databases miss.

## 3. Qualify

Score each on fit, reach (patients/members/employees), accessibility of decision maker, and alignment with BioLife's values (evidence-based, no over-promising). Drop poor fits.

## 4. Deliver

- A CSV ready for `lead-import-cleaner` → CRM import, with `source = partnership-<type>-<city>`.
- Top 10 with a one-line reason each.
- A partnership pitch tailored to the partner type (value for them, not just for us) + first message (`cold-email-writer` / `whatsapp-followup`).
