---
name: n8n-workflow-builder
description: Design and build n8n automation workflows for BioLife Health — website lead form → CRM, WhatsApp/Gmail notifications for new leads, follow-up reminders, lead enrichment, daily reports, social-to-CRM — producing importable n8n workflow JSON and setup steps. Use when the user wants to automate anything between tools, mentions n8n, Zapier/Make-style automation, webhooks, or "a3mel automation".
---

# n8n workflow builder

n8n is a planned (not yet built) integration for BioLife CRM, so each workflow must respect the CRM's security model.

## Design first

For each workflow: trigger → steps → outputs → failure handling. Show it as a numbered flow and confirm before building.

## Security rules

- The CRM authorizes via Supabase RLS. An automation that writes to the CRM needs a server-side path: preferably a dedicated Next.js route handler in the CRM that validates input with zod and a shared secret, rather than giving n8n the service-role key. If the service-role key is used, it lives only in n8n credentials, never in workflow JSON, and the user must understand it bypasses RLS.
- No credentials in the exported JSON — use n8n credential references.
- Validate/normalize incoming leads (phone to +20 format, dedupe by phone/email) before insert.
- Rate-limit/dedupe webhook triggers to avoid duplicate leads.

## Output

1. The n8n workflow JSON (importable), nodes named clearly.
2. Setup steps: credentials to create, env vars, webhook URL to paste where.
3. Test plan with a sample payload.
4. If CRM code changes are needed (a new endpoint), list them for the CRM repo (follow `crm-feature-scaffold` / `zod-server-action` there).
