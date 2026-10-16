---
name: brand-voice
description: Capture and apply Ahmed's personal voice fingerprint — his recurring openings, phrases, vocabulary, rhythm and the words he never uses — on top of the rules in ahmed-content-voice. Use when building or updating his voice profile from his real posts, scripts or voice notes ("ebni el voice bta3i", "7allel kalami"), when a draft "doesn't sound like me" and needs to be reviewed or rewritten in his voice, and before publishing any important caption, script, email or WhatsApp broadcast for Holistic with Ahmed or BioLife Health.
---

# Brand voice

Two layers, and they must not contradict each other:

1. **Rules**: the `ahmed-content-voice` skill. It is the source of truth for language per audience, titles (Ahmed is not a doctor), CTA wording («قدّم على جلستك»), the free-sessions number, his story framing, and health-claim rules. If anything here disagrees with it, that skill wins. Read it before writing.
2. **Fingerprint**: `references/voice-profile.md` in this skill. It holds what rules can't: how he actually sounds. It is built from his real material, not invented.

## Build or update the fingerprint

Use real material only: captions he published, reel scripts he recorded, transcripts of his voice notes, posts he says are "very me", plus 2–3 he dislikes. Ask for them if none are in the conversation. Six to ten pieces is enough to start.

From that material, fill each section of `references/voice-profile.md`:
- **Openings**: how his hooks and first lines actually start, quoted.
- **Signature phrases**: expressions he repeats, quoted with where they appear.
- **Vocabulary**: which technical terms he keeps in English, which he says in Arabic, and Egyptian words he favours.
- **Words and moves he avoids**: from the disliked pieces and his corrections.
- **Rhythm**: sentence length, line breaks, how he moves from hook to explanation to the reflective question, emoji use.
- **Closings**: how he ends with the reflective question, the CTA, and the medical-care line.
- **Before → after**: two or three examples of a generic sentence and his version of it.

Quote him exactly. A pattern that appears only once is a guess, so mark it "(مرة واحدة)" until it repeats. Show Ahmed the updated profile and apply his corrections before saving. Then give it back as a file. He can replace `references/voice-profile.md` in this skill with it, or add it to his Claude Project knowledge.

## Apply it

When writing or rewriting in his voice:
1. Follow `ahmed-content-voice`.
2. Use the fingerprint: his openings, his phrases where they fit naturally, his rhythm. Never stuff in every signature phrase at once.
3. If the profile is still empty, say so in one line and write from the rules alone. Don't pretend to know his phrases.

## Review mode

When given a draft:
- Voice fit from 1 to 10, with one line on why.
- Lines that sound generic or off-voice, quoted, each with his version.
- The six checks from `ahmed-content-voice` («قبل التسليم»): title, no cure promise, CTA as «قدّم», every number sourced, his voice, free sessions = 7.
- The full rewritten version.

Specific or debatable health claims go through `health-claim-check`.
