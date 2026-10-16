---
name: meeting-to-crm
description: Turn raw meeting/call notes, voice-note transcripts, or chat summaries into structured BioLife CRM updates — a clean note, next tasks with due dates, pipeline stage suggestion, temperature, follow-up date — plus the follow-up message to the client. Use right after any call or meeting, when the user pastes messy notes, or says "sagel el meeting", "7ot da fel CRM".
---

# Meeting → CRM

## Extract

From the notes, pull out: who attended, their needs/pain points, budget/timing signals, objections, what was agreed, what we promised, what they promised, decision process.

## Produce

1. **CRM note** (short, factual, dated, Arabic or English as the team uses):
   `YYYY-MM-DD — مكالمة مع ... | اتفقنا على ... | اعتراضات ... | الخطوة الجاية ...`
2. **Tasks** — one per commitment: title, owner, due date (absolute date, not "next week").
3. **Stage suggestion** — choose from the CRM's actual pipeline stages (ask for the list if unknown; stage names are configured in the CRM, don't assume them) with a one-line reason.
4. **Temperature** (cold/warm/hot) and **next_follow_up_at**.
5. **Follow-up message** to the client (email or WhatsApp via `whatsapp-followup`) confirming the agreement.
6. Optionally a Calendar event for the next meeting if one was agreed (`create_event`) — only when the user asks.

Don't invent anything not in the notes; list gaps as questions ("مين صاحب القرار النهائي؟ مش مذكور").
