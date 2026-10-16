# BioLife Skills Pack

50 skill لشغل BioLife Health: تطوير الـ CRM، والمبيعات، والمحتوى، والتشغيل.

## الـ skills دي متحطة فين

| المكان | العدد | بيشتغل إزاي |
|---|---|---|
| `.claude/skills/` | 15 (تطوير الـ CRM) | بتشتغل تلقائي في أي Claude Code session على الريبو ده، ومش محتاجة تسطيب |
| `skills-pack/` | 35 (مبيعات، ومحتوى، وتشغيل) | محتاجة تتسطب في حسابك مرة واحدة |

## التسطيب

**على claude.ai أو الموبايل:** Settings → Capabilities → Skills → Upload skill. ارفع ملف `.skill` لكل skill (ممكن تعيد تسميته لـ `.zip` لو الرفع طلب zip).

**في Claude Code على جهازك** (عشان يشتغلوا في كل المشاريع):
```bash
cp -r skills-pack/*/ ~/.claude/skills/
```

**تجهيز ملفات `.skill` من جديد** بعد أي تعديل: اطلب من Claude "package the skills-pack".

## الـ 50 skill

### تطوير الـ CRM (`.claude/skills/`)
supabase-migration · rls-audit · role-access-tests · crm-feature-scaffold · nextjs16-conventions · zod-server-action · pipeline-stage-guard · e2e-flows · preflight · secrets-guard · supabase-types-sync · ui-rtl-arabic · bug-hunt · query-performance · release-notes

### المبيعات والـ BD
account-research · lead-enrichment · icp-scoring · lead-import-cleaner · dedupe-merge · cold-email-writer · whatsapp-followup · outreach-sequence · call-prep · meeting-to-crm · proposal-builder · sales-deck · objection-playbook · pipeline-review · sales-forecast · inbox-triage · partnership-hunter

### المحتوى والتسويق
brand-voice · content-calendar · repurpose-engine · carousel-designer · social-analytics · ad-compliance · newsletter-writer · landing-page-builder · case-study-writer · book-partner

### التشغيل والإدارة
weekly-kpi-report · daily-plan · sop-writer · team-onboarding · n8n-workflow-builder · health-data-privacy · competitor-watch · decision-memo

## حاجات مهمة

- الـ skills بتشتغل مع skills عندك أصلاً، زي `health-claim-check` و`hook-factory` و`meaning-to-content`، وبتنادي عليها لما تحتاجها.
- `brand-voice` مبني فوق `ahmed-content-voice`: القواعد هناك، و`brand-voice` بيضيف عليها "بصمة" أسلوبك من كلامك الحقيقي (الافتتاحيات، والجمل اللي بتكررها، والإيقاع). الـ skills بتاعة الكاروسيل والـ deck وصفحات الهبوط بتمشي على `ahmed-design-standards`.
- `icp-scoring` هيحتاج يعرف منك العميل المثالي أول مرة.
- الـ skills اللي بتصرف credits على Apollo أو Vibe Prospecting بتقولك التكلفة الأول قبل ما تصرف.
- ولا skill منهم بيبعت إيميل أو ينشر بوست من غير موافقتك. بيجهز drafts بس.
- `carousel-designer` محتاج ربط Canva من إعدادات الـ connectors.
