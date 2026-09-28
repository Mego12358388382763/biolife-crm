---
name: proposal-builder
description: Create a professional commercial proposal or quotation for a BioLife Health client or partner — needs, solution, scope, pricing, timeline, terms — as a Word or PDF document in Arabic or English. Use when the user asks for a proposal, offer, quotation, عرض سعر, partnership offer, or "ab3atlo 3ard".
---

# Proposal builder

## Inputs (ask only for what's missing)

Client, contact person, what they need (from `meeting-to-crm` notes), what we're offering, prices (never invent prices — ask), validity, payment terms, language.

## Structure

1. Cover: BioLife Health, client name, date, reference number.
2. فهمنا لاحتياجكم — their situation in their words.
3. الحل المقترح — what we deliver, mapped to each need.
4. نطاق العمل والتسليمات — clear inclusions and exclusions.
5. الجدول الزمني.
6. الأسعار — table, taxes stated, validity date.
7. ليه BioLife — proof points (only real ones).
8. الخطوات الجاية — how to accept.
9. الشروط والأحكام الأساسية.

## Rules

- Health/wellness statements must be accurate and non-promissory; run claims through `health-claim-check`.
- Use the `docx` skill for Word (default, so they can edit) or `pdf` when asked for a final PDF.
- Arabic documents: right-to-left layout, Arabic-capable font.
- End with a short summary to the user of prices and terms used so they can double-check.
