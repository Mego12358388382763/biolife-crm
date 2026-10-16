---
name: sales-forecast
description: Forecast BioLife Health sales/revenue for the month or quarter from the CRM pipeline using stage probabilities, deal values and historical conversion, with best/likely/worst scenarios and the gap to target. Use when the user asks "hanbe3 kam", about targets, expected revenue, or planning.
---

# Sales forecast

1. **Data**: open leads/deals with stage, expected value (ask for values or average deal size if the CRM doesn't store them), expected close date, and historical won/lost if available. Targets from the CRM's performance targets or the user.
2. **Stage probabilities**: compute from history when there's enough data (≥ 30 closed); otherwise agree assumptions with the user and label them clearly as assumptions.
3. **Scenarios**:
   - Likely = Σ value × stage probability for deals closing in the period
   - Best = likely + hot deals at 1.5× probability (capped at 90%)
   - Worst = only late-stage deals at their probability
4. **Gap to target** and what closes it: how many more leads/meetings/proposals are needed given conversion rates.
5. **Output**: a small table, one chart, and 3 recommended actions. State assumptions in plain words. Never present a forecast as certain.
