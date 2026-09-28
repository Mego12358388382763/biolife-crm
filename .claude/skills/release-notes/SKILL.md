---
name: release-notes
description: Turn recent commits/merged PRs of BioLife CRM into clear release notes for the sales team in Egyptian Arabic (plus a short English technical section), explaining what changed, how to use it, and anything they must do. Use when the user asks what changed, wants to announce an update to the team, or before/after a deploy.
---

# Release notes

1. Find the range: since the last tag, the last notes, or the date the user gives. `git log --oneline <range>` and read the diffs of anything non-trivial — commit titles alone can mislead.
2. Classify: new features, improvements, fixes, admin-only changes, anything requiring action (e.g. re-login, new permission, migration applied).
3. Write for salespeople, not developers: what they can now do, where the button is, in 1–2 lines each.

## Format

```
# تحديث BioLife CRM — <التاريخ>

## الجديد
- ...
## تحسينات
- ...
## اتصلّح
- ...
## مطلوب منك
- ... (or "مفيش حاجة مطلوبة")

---
Technical (EN): migrations, breaking changes, env vars.
```

Keep it short enough to send on WhatsApp. No internal secrets, URLs with tokens, or customer data.
