---
name: pipeline-review
description: Review BioLife CRM's sales pipeline — stuck deals, leads with no next step, overdue follow-ups and tasks, stage conversion, workload per salesperson — and produce a prioritized action list. Use for weekly sales meetings, when the user asks "el pipeline 3amel eh", "min el leads el mnseyeen", or shares a CRM export/report.
---

# Pipeline review

## Input

A CRM export (leads with stage, assigned_to, temperature, lead_score, last_contact_at, next_follow_up_at, created_at, updated_at) and tasks, or numbers from the CRM Reports page. Use the stage names and order from the data — they are configurable, so don't assume them.

## Analyze

1. **Snapshot**: leads per stage, per owner, per temperature.
2. **Stuck**: in the same stage longer than the typical time for that stage (compute the median, flag > 2×).
3. **Orphans**: no `next_follow_up_at`, or it's in the past; hot/warm leads with no contact in 7+ days.
4. **Overdue tasks** per person.
5. **Conversion**: stage-to-stage, if stage history is available.
6. **Workload**: open leads per salesperson; imbalance.

## Output (Egyptian Arabic)

- 3-line summary for the manager.
- Top 10 actions this week: lead, owner, action, why.
- Risks and one process improvement.
- Charts only if helpful (use `dataviz` guidance).

Keep names of colleagues factual and neutral — this is for coaching, not blame.
