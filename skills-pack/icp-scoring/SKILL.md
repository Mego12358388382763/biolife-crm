---
name: icp-scoring
description: Score and prioritize BioLife Health leads or accounts against the Ideal Customer Profile (0-100 lead_score plus hot/warm/cold temperature) with reasons. Use when the user has a list of leads to prioritize, asks "min a7san wa7ed", "rattebli el leads", "who should we call first", wants to set lead_score/temperature in the CRM, or wants to define the ICP.
---

# ICP scoring

BioLife CRM stores `lead_score` (0–100) and `temperature` (cold/warm/hot). This skill fills them consistently so the team calls the right people first.

## 1. Get the ICP

If the ICP isn't already known (memory or conversation), draft one with the user in a few questions: target segments (e.g. clinics, gyms, corporates, pharmacies, nutritionists), size, geography, decision-maker titles, buying signals, disqualifiers. Save the agreed ICP back to the user as a reusable block.

## 2. Scoring model (adjust weights to the ICP)

| Factor | Points |
|---|---|
| Segment fit | 0–30 |
| Decision-maker title | 0–20 |
| Size / budget signals | 0–15 |
| Location fit | 0–10 |
| Engagement (replied, met, visited site) | 0–15 |
| Timing signals (new branch, hiring, news) | 0–10 |
| Disqualifier present | score = min(score, 20) |

Temperature: hot ≥ 70, warm 40–69, cold < 40 (unless engagement says otherwise).

## 3. Output

Table sorted by score: name, company, score, temperature, one-line reason, next action. Plus a CSV with `lead_score` and `temperature` columns for import. Be explicit when a score rests on missing data.
