---
name: call-prep
description: Prepare a one-page brief before a sales call or meeting with a BioLife Health prospect or partner — who they are, history from CRM/Gmail/Calendar, goal of the call, agenda, questions, likely objections, and next step to propose. Use when the user has a call or meeting coming up, says "3andi meeting", "gahezni lel mokalma", or asks about tomorrow's meetings with prospects.
---

# Call prep

## Gather

1. Calendar (`list_events`/`search_events`) — find the meeting, attendees, time.
2. Gmail (`search_threads` by attendee email/company) — last exchanges, what was promised.
3. CRM info the user shares — stage, notes, tasks, previous calls.
4. `account-research` for anything unknown about the company/person.

## Brief (Egyptian Arabic, fits one screen)

```
## مكالمة مع <الاسم> — <الشركة> — <الميعاد>
الهدف من المكالمة: (نتيجة واحدة واضحة، مثلاً: ميعاد زيارة / موافقة على تجربة)
هما مين في سطرين:
اللي حصل قبل كده:
أجندة (15-30 دقيقة):
أسئلة اكتشاف (5):
اعتراضات متوقعة + الرد (من objection-playbook):
الخطوة الجاية اللي هتطلبها:
ماتقولش: (أي claim صحي مش متأكد منه، أسعار مش معتمدة)
```

After the call, use `meeting-to-crm`.
