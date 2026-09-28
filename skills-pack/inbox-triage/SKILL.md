---
name: inbox-triage
description: Triage Ahmed's Gmail for sales and business — find lead replies, partner emails, client requests and anything urgent, classify them, draft replies, and list CRM updates needed. Use when the user says "shof el emails", "eh el gdid", "reply on leads", or asks what needs attention in the inbox.
---

# Inbox triage

1. Search recent threads (`search_threads`, e.g. `newer_than:2d -category:promotions -category:social`), read the relevant ones (`get_thread`).
2. Classify each:
   - 🔴 Urgent/client waiting
   - 🟢 Lead reply (interested / question / not interested / out of office)
   - 🔵 Partner / vendor
   - ⚪ FYI / newsletters
3. For replies needed: draft in the sender's language and tone (`create_draft`). Never send; drafts only, and say which drafts were created.
4. CRM updates: for lead replies, list the lead, what changed, suggested stage/temperature/next follow-up (for `meeting-to-crm`-style entry).
5. Labels: only apply labels if the user asked.

Output: a short list grouped by class — sender, subject, one-line summary, action, draft ✅/—. Don't paste full emails back. Be careful with sensitive health information in emails — summarize minimally.
