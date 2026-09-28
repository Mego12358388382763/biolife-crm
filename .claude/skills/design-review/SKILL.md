---
name: design-review
description: Critique and improve visual designs, including social media posts, carousels, ads, flyers, brand assets, slides, landing pages and app screenshots, and write clear design briefs for designers or AI image tools. Use when the user shares a design or screenshot and asks for feedback, says راجع التصميم, حسّن الديزاين, or needs a design brief or visual direction.
---

# Design Review & Direction — مراجعة وتحسين الديزاين

## 1. Context first
Goal of the design (awareness, conversion, information), where it will appear (feed, story, print, app), audience, and brand constraints (logo, colours, fonts). If a design is shared as an image, look at it before commenting.

## 2. Review lenses (in priority order)
1. **Message**: is the single main message understood in 3 seconds? Is there one clear CTA?
2. **Hierarchy**: does the eye go headline → key visual → supporting text → CTA? Is exactly one element dominant?
3. **Readability**: text size on a phone screen, contrast (WCAG AA), line length, amount of text (for social, the less text the better).
4. **Layout**: alignment to a grid, consistent margins, breathing room, nothing touching the edges or cropped by platform UI (story safe zones, profile overlays).
5. **Typography**: at most 2 font families; Arabic and Latin fonts paired well; correct RTL alignment and no broken letter joining.
6. **Colour**: on-brand, limited palette, colour used for emphasis and not decoration; accessible to colour-blind users.
7. **Imagery**: relevant, consistent style and quality, authentic (not generic stock) where possible, rights-safe.
8. **Compliance**: health claims are substantiated and there are no misleading before/after visuals (BioLife).

## 3. Output format
- **Verdict** in one line.
- **Top 3 fixes** (the most impact for the least effort), each with *what*, *why* and *how* (exact values when possible: size, hex, spacing).
- **Other notes** grouped by the lenses above.
- Optional: a revised layout described as a wireframe (ASCII or bullet zones).

## 4. Writing a design brief
```
Objective:        what this design must achieve (one sentence)
Audience:         who sees it, where, and in what mindset
Key message:      headline text (final copy)
Supporting copy:  ≤2 short lines
CTA:              text + destination
Format & sizes:   e.g. 1080×1350 feed, 1080×1920 story, A4 print
Brand:            logo usage, palette (hex), fonts
Visual direction: mood, references, image style, what to avoid
Deliverables:     files, formats, deadline
```
For AI image tools, turn the brief into a prompt with the `prompt-engineer` skill (subject, composition, style, lighting, palette, aspect ratio, negatives).
