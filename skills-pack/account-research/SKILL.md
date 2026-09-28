---
name: account-research
description: Research a target company or person before outreach or a meeting for BioLife Health's sales/BD — what they do, size, locations, decision makers, recent news, fit with BioLife, and a suggested angle. Use whenever Ahmed or the team names a clinic, gym, hospital, pharmacy, corporate, or person and wants to know about them, says "e3rafli 3an", "ab7athli", "mean da", or is about to contact or meet a prospect.
---

# Account research

Goal: in 5 minutes of reading, the salesperson knows who this is, whether they're worth time, and what to say first.

## Sources (use what's connected)

1. Apollo (`apollo_organizations_enrich`, `apollo_mixed_people_api_search`) or Vibe Prospecting (`match-business`, `enrich-business`) for firmographics and decision makers. Many calls cost credits — state the expected cost before spending and report credits used afterwards.
2. Web search for the company website, Google Maps/branches, social pages, news in the last 12 months, job postings (signals growth or new departments).
3. The CRM (if the user shares an export or record): previous contact, stage, notes.

## What BioLife offers

If you don't already know from memory or the conversation what BioLife Health sells and to whom, ask once in one line instead of guessing — a wrong "fit" analysis is worse than none.

## Output (Egyptian Arabic, English names kept as-is)

```
## <Company> — ملخص سريع
- بيعملوا إيه:
- الحجم / الفروع:
- أصحاب القرار: الاسم — المنصب — (LinkedIn/إيميل لو موجود)
- أخبار وإشارات مهمة:
- مناسبين لـ BioLife؟ (عالي/متوسط/ضعيف) وليه:
- أحسن مدخل للكلام:
- 3 أسئلة تسألها في أول مكالمة:
- المصادر:
```

Mark anything unverified as "(مش متأكد)". Never invent names, numbers or emails.
