---
name: outreach-sequence
description: Design and (optionally) build a multi-step outreach sequence for BioLife Health — email, WhatsApp, call and LinkedIn touches with timing, copy for each step, and exit rules — and create it in Apollo if connected. Use when the user wants a campaign, cadence, sequence, drip, or to follow up with a list systematically.
---

# Outreach sequence

## Design

Ask/confirm: audience segment, goal, channels available, list size, sender.

Default B2B cadence (adjust):
| Day | Channel | Purpose |
|---|---|---|
| 1 | Email | personalized intro (see `cold-email-writer`) |
| 2 | LinkedIn | connect, no pitch |
| 4 | Call | 30-sec opener + ask for meeting |
| 5 | WhatsApp | short reference to email (only if the number is a business contact) |
| 8 | Email | value add: case, insight, resource |
| 12 | Call | second attempt |
| 16 | Email | breakup: "should I close your file?" |

Exit rules: stop on reply, meeting booked, bounce, or opt-out.

## Build in Apollo (if connected and the user approves)

`apollo_sequences_create` with the steps, then `apollo_emailer_campaigns_add_contact_ids` for approved contacts. Never activate/send without explicit approval (`apollo_emailer_campaigns_approve` only when asked). Show mailbox and daily limits first.

## Output

The cadence table, every message fully written, and the CRM tasks to create for manual steps (calls, WhatsApp).
