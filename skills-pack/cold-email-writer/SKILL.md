---
name: cold-email-writer
description: Write personalized B2B cold emails and follow-ups for BioLife Health in English or Arabic, based on the prospect's company/role research, with subject lines and a clear low-friction ask. Use when the user wants to email a prospect, partner, clinic, corporate HR, or asks "ektebli email", "3ayez ab3at le...", including drafting directly in Gmail.
---

# Cold email writer

## Inputs

Prospect name, role, company, one real personalization point (from `account-research` or the user), the goal (meeting, sample, partnership, demo). If there's no real personalization point, find one or say it's generic — fake flattery hurts reply rates.

## Principles

- 60–120 words. One idea. One ask.
- Open with them, not BioLife: a specific observation about their business.
- One sentence of value tied to their likely problem, with proof if available (a number, a client type) — never invent results or health claims; run anything medical past `health-claim-check`.
- Ask for something small: "15 minutes next week?" / "should I send the one-pager?"
- Plain text, no images, no attachments in the first email.
- Language: English for corporates/multinationals; professional Arabic (فصحى مبسطة) or Egyptian for local businesses — ask if unclear.

## Output

- 3 subject lines (short, lowercase-ish, no clickbait).
- The email.
- 2 follow-ups (day 3 and day 7), each adding something new, not "just bumping this".
- If Gmail is connected and the user wants, create drafts with `create_draft` — don't send.
