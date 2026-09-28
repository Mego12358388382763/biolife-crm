---
name: sales-copywriting
description: Write persuasive sales and business-development copy for BioLife Health, including cold outreach emails, WhatsApp and LinkedIn messages, follow-up sequences, proposals, landing-page and ad copy, and offer descriptions, in Arabic (Egyptian/Gulf/MSA) or English. Use when the user asks for outreach, a follow-up, a sales message, رسالة للعميل, إيميل, كوبي, إعلان, or a sequence for leads in the CRM.
---

# Sales Copywriting — كتابة المحتوى البيعي

## 1. Inputs
- **Who**: lead role, company type (clinic, pharmacy, gym, corporate HR…), what we know about them (from the lead or company record, if provided).
- **Offer**: the product or service and the specific outcome it gives this type of customer.
- **Stage**: cold, warm (engaged before), post-meeting, proposal sent, gone quiet. Map to the CRM pipeline stage when one is given.
- **Channel & language**: email, WhatsApp, LinkedIn, ad, landing page.
- **CTA**: the one small next step (15-min call, reply with a time, book a demo, visit link).

## 2. Frameworks (pick one, don't announce it)
- **PAS**: Problem → Agitate (cost of inaction) → Solution.
- **AIDA**: Attention → Interest → Desire → Action (ads, landing pages).
- **BAB**: Before → After → Bridge (case-study style).
- **Cold outreach 4-line**: personal observation → relevant problem → one-line proof → soft CTA.

## 3. Rules
- Lead with *them*, not us: the first line is about the reader's situation.
- One message = one idea + one CTA. Cold messages ≤ 90 words; WhatsApp ≤ 60.
- Specific proof beats adjectives: a real number, client type or result, **only if it's true and provided**. Never invent testimonials, statistics or client names.
- Subject lines: 2–6 words, lowercase-feel, no clickbait or spam triggers (FREE, !!!, 100%).
- Follow-ups add something new each time (insight, case, question), never "just bumping this". Default sequence: day 0, 3, 7, 14, then a polite close-the-loop message.
- Health/wellness compliance: no cure, treatment or guarantee claims, no before/after promises. Benefit language must be substantiated. When unsure, flag it (the `health-claim-check` skill can verify claims).
- Respect opt-outs; include an easy way to say no in sequences.
- Run the result through the `humanize-text` rules so it doesn't read like a template.

## 4. Output format
- The copy, ready to send, with `{{personalisation}}` fields marked.
- For sequences: a table of step, day, channel, goal and message.
- 2 subject-line or hook options when relevant.
- One line on why this angle fits this lead or stage.
