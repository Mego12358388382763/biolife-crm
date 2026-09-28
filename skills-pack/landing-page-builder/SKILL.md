---
name: landing-page-builder
description: Build a high-converting landing page with a lead form for BioLife Health campaigns, programs, events, lead magnets or the book — copy, design, mobile-first HTML, deploy to Netlify, and send submissions into BioLife CRM (via a webhook/n8n or CSV). Use when the user wants a landing page, sales page, sign-up form, registration page, or "saf7a lel e3lan".
---

# Landing page builder

## Copy (Egyptian Arabic, RTL)

1. Hero: outcome-focused headline (safe claims), subheadline, one CTA button.
2. The problem in their words.
3. What they get (3–5 bullets).
4. How it works (3 steps).
5. Proof: real testimonials only (with consent), credentials.
6. FAQ (5 real objections).
7. Final CTA + form.
8. Disclaimer: "المحتوى ده للتوعية ومايغنيش عن استشارة الطبيب" where relevant. Claims pass `health-claim-check` and `ad-compliance` if it's for ads.

## Build

- Single responsive HTML page, fast, no heavy frameworks; Arabic font; `dir="rtl"`; phone field with Egyptian format hint.
- Form fields = CRM lead fields (name, phone/WhatsApp, email optional, city, source hidden = campaign name, UTM params captured).
- Consent checkbox for contact. Basic spam protection (honeypot).
- Deploy with the Netlify connector when the user approves; share the URL.

## Into the CRM

Website lead forms aren't integrated in the CRM yet. Options: Netlify Forms → export CSV → `lead-import-cleaner` → CRM import; or a webhook to n8n (see `n8n-workflow-builder`) once that integration is built. Never put Supabase service keys in the page.
