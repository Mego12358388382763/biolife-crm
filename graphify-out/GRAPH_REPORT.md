# Graph Report - biolife-crm  (2026-10-28)

## Corpus Check
- 108 files · ~26,363 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .ico 1, .css 1)

## Summary
- 550 nodes · 1903 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a4ab443`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- 20260101000000_initial_schema.sql
- Card
- requireProfile
- createClient
- import-form.tsx
- ref_next
- Button
- cn
- data/lead-import.ts
- reports/actions.ts
- reports/dashboard/page.tsx
- daily-activity-form.tsx
- database.ts
- header.tsx
- dropdown-menu.tsx
- utils.ts
- sheet.tsx
- database.generated.ts
- app/layout.tsx
- calendar.tsx
- eslint.config.mjs
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 112 edges
2. `requireProfile()` - 48 edges
3. `Button()` - 46 edges
4. `createClient()` - 46 edges
5. `Card()` - 36 edges
6. `CardContent()` - 36 edges
7. `canWrite()` - 34 edges
8. `CardHeader()` - 32 edges
9. `CardTitle()` - 30 edges
10. `Input()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `handleDragEnd()` --calls--> `moveLeadStageAction()`  [EXTRACTED]
  components/pipeline/pipeline-board.tsx → app/(app)/leads/actions.ts
- `DailyActivityForm()` --indirect_call--> `submitDailyReportAction()`  [INFERRED]
  components/reports/daily-activity-form.tsx → app/(app)/reports/actions.ts
- `AvatarImage()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  components/ui/avatar.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "20260101000000_initial_schema.sql"
Cohesion: 0.06
Nodes (54): companies, companies_created_by_idx, companies_deleted_at_idx, companies_name_idx, companies_set_updated_at, handle_new_user(), lead_stage_history, lead_stage_history_changed_at_idx (+46 more)

### Community 1 - "Card"
Cohesion: 0.19
Nodes (31): CompanyDetailPage(), NewCompanyPage(), CompaniesPage(), DashboardPage(), ImportLeadsPage(), ReportsIndexPage(), SettingsPage(), LoginPage() (+23 more)

### Community 2 - "requireProfile"
Cohesion: 0.13
Nodes (37): createLeadAction(), LeadFormState, moveLeadStageAction(), parseLeadFormData(), updateLeadAction(), NewLeadPage(), LeadsPage(), PipelinePage() (+29 more)

### Community 3 - "createClient"
Cohesion: 0.11
Nodes (34): LeadDetailPage(), completeTaskAction(), deleteTaskAction(), PRIORITY_VARIANT, TaskList(), TasksPage(), LeadCard(), PipelineBoard() (+26 more)

### Community 4 - "import-form.tsx"
Cohesion: 0.11
Nodes (32): commitImportAction(), downloadErrorReport(), ImportForm(), handleConfirm(), initialState, createTeamUserAction(), createUserSchema, CreateUserState (+24 more)

### Community 5 - "ref_next"
Cohesion: 0.11
Nodes (18): createCompanyAction(), deleteCompanyAction(), parseCompanyFormData(), updateCompanyAction(), DeleteCompanyButton(), cleanCompanyInput(), createCompany(), deleteCompany() (+10 more)

### Community 6 - "Button"
Cohesion: 0.14
Nodes (20): deleteLeadAction(), deleteLeadsAction(), DeleteLeadButton(), LeadRow, LeadsTable(), handleBulkDelete(), TEMPERATURE_VARIANT, DeleteConfirmDialog() (+12 more)

### Community 7 - "cn"
Cohesion: 0.12
Nodes (26): AlertAction(), CardAction(), CardFooter(), Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+18 more)

### Community 8 - "data/lead-import.ts"
Cohesion: 0.13
Nodes (22): PreviewFormState, previewImportAction(), buildImportPreview(), ColumnMapping, commitImport(), resolveCompanyId(), ImportPreview, ImportResult (+14 more)

### Community 9 - "reports/actions.ts"
Cohesion: 0.12
Nodes (16): DailyActivityFormState, submitDailyReportAction(), DailyActivityPage(), todayIso(), RFC-4122, cleanInput(), getDailyReport(), upsertDailyReport() (+8 more)

### Community 10 - "reports/dashboard/page.tsx"
Cohesion: 0.16
Nodes (20): PerformanceDashboardPage(), DashboardFiltersProps, ChannelVolume, EMPTY_TOTALS, fetchRows(), getActivityTotals(), getChannelVolumes(), getTeamPerformance() (+12 more)

### Community 11 - "daily-activity-form.tsx"
Cohesion: 0.17
Nodes (14): CompanyFormState, TaskFormState, CompanyForm(), CompanyFormProps, initialState, COUNT_FIELDS, Counts, DailyActivityFormProps (+6 more)

### Community 12 - "database.ts"
Cohesion: 0.14
Nodes (12): createTeamUser(), generateStrongPassword(), createAdminClient(), Database, Lead, LeadStageHistory, LeadTemperature, Profile (+4 more)

### Community 13 - "header.tsx"
Cohesion: 0.20
Nodes (11): AppLayout(), Header(), initials(), NAV_ITEMS, Sidebar(), Avatar(), AvatarBadge(), AvatarFallback() (+3 more)

### Community 14 - "dropdown-menu.tsx"
Cohesion: 0.13
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 15 - "utils.ts"
Cohesion: 0.15
Nodes (6): Checkbox(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), Separator()

### Community 16 - "sheet.tsx"
Cohesion: 0.22
Nodes (7): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetPortal(), SheetTitle()

### Community 17 - "database.generated.ts"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 18 - "app/layout.tsx"
Cohesion: 0.28
Nodes (5): geistMono, geistSans, metadata, RootLayout(), Toaster()

### Community 19 - "calendar.tsx"
Cohesion: 0.60
Nodes (3): buttonVariants, Calendar(), CalendarDayButton()

## Knowledge Gaps
- **1 isolated node(s):** `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 106 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `Card`, `requireProfile`, `createClient`, `import-form.tsx`, `Button`, `daily-activity-form.tsx`, `header.tsx`, `dropdown-menu.tsx`, `utils.ts`, `sheet.tsx`, `calendar.tsx`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **What connects `RFC-4122` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `20260101000000_initial_schema.sql` be split into smaller, more focused modules?**
  _Cohesion score 0.05920745920745921 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `Card`, `requireProfile`, `createClient`, `import-form.tsx`, `cn`, `daily-activity-form.tsx`, `header.tsx`, `sheet.tsx`, `calendar.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `requireProfile` be split into smaller, more focused modules?**
  _Cohesion score 0.12854609929078015 - nodes in this community are weakly interconnected._
- **Why does `createClient()` connect `createClient` to `Card`, `requireProfile`, `import-form.tsx`, `ref_next`, `data/lead-import.ts`, `reports/actions.ts`, `reports/dashboard/page.tsx`, `database.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.10545790934320073 - nodes in this community are weakly interconnected._