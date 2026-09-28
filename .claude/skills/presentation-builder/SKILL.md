---
name: presentation-builder
description: Plan, write and structure presentations and pitch decks (sales pitches, partner proposals, investor decks, internal reviews, training) in Arabic or English. Use when the user asks for a presentation, deck, slides, برزنتيشن, عرض تقديمي, pitch, or wants an existing deck improved. Produces the storyline, slide-by-slide content, speaker notes and visual direction; hands off to the pptx skill or a slides artifact when an actual file is needed.
---

# Presentation Builder — بناء البرزنتيشن

## 1. Brief (collect first; ask only for what's missing)
- **Audience**: who's in the room, and what they already know or care about.
- **Goal**: the one action or decision wanted at the end (sign, approve budget, book a pilot, learn X).
- **Context**: live talk, sent as a PDF, or both. Time slot (e.g. 10 min ≈ 8–10 slides).
- **Language/direction**: Arabic (RTL), English, or bilingual.
- **Assets**: logo, brand colours, data, case studies, product photos.

## 2. Storyline first, slides second
Write the narrative as 5–8 one-sentence headlines before designing anything. Default arcs:

| Deck type | Arc |
|---|---|
| Sales / partner pitch | Problem → Cost of the problem → Our solution → How it works → Proof (results, case) → Offer & pricing → Next step |
| Investor | Problem → Solution → Market → Product → Traction → Business model → Team → Ask |
| Internal update | Headline result → What happened → Why → What's next → Decisions needed |
| Training / workshop | Why it matters → Concept → Example → Practice → Recap → Resources |

Check the storyline by reading only the headlines: they alone should tell the whole story.

## 3. Slide rules
- **One idea per slide.** The title is a full sentence stating the takeaway ("Clinics lose 30% of leads in the first 48h"), not a label ("Lead Loss").
- Max ~30 words of body text per slide; details go in speaker notes.
- Numbers: one big number per slide beats a table. Always give the source and the period.
- Charts: pick the simplest form (bar > pie), highlight the one series that matters, label directly.
- Visual hierarchy: title → key visual → supporting text. Consistent grid, margins and font sizes.
- Arabic decks: RTL layout, right-aligned text, mirrored arrows and timelines, an Arabic-friendly font (e.g. Cairo, Tajawal, IBM Plex Sans Arabic). Don't mix directions on one slide.
- End on a clear call to action and contact details, not "Thank you / Questions?" alone.
- Health or medical claims (BioLife): only what's substantiated; cite sources; no cure or guarantee language.

## 4. Output format
For each slide:
```
Slide N — <takeaway title>
Visual: <what's shown: chart/photo/diagram/big number + layout note>
On-slide text: <≤30 words>
Speaker notes: <what to say, 40–120 words>
```
Then a short **Design direction** block: palette (3–5 hex codes), fonts, image style and the recurring layout(s).

## 5. Producing the file
- User needs a `.pptx` → use the `pptx` skill with the content above.
- A shareable web deck → use the slides artifact type (Artifact quickstart with `intent: "slides"`).
- Otherwise deliver the outline in chat.

## 6. Review an existing deck
Score each slide on: clear takeaway title, one idea, readability (word count and contrast), evidence, and flow into the next slide. Return the top 5 fixes first, then slide-by-slide notes.
