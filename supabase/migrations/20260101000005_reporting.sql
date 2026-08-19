-- BioLife CRM — Sales Activity, Performance & Reporting foundation.
--
-- Additive only: new tables + one new nullable column on leads. Nothing
-- existing is altered, renamed, or dropped. Safe to apply to production.

-- ---------------------------------------------------------------------------
-- leads.deal_value — needed for Revenue reporting on won deals. Nullable,
-- no default-value backfill required, existing rows unaffected.
-- ---------------------------------------------------------------------------

alter table leads add column deal_value numeric(12, 2);
comment on column leads.deal_value is 'Deal value in the business default currency, set when a lead is won. Used for revenue reporting.';

-- ---------------------------------------------------------------------------
-- daily_activity_reports
-- One row per team member per calendar day. Upserted from the Daily
-- Activity form (Reports → Daily Activity). All counters default to 0
-- rather than null so aggregation/division never has to null-guard.
-- ---------------------------------------------------------------------------

create table daily_activity_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  report_date date not null,

  -- Outreach
  people_contacted int not null default 0 check (people_contacted >= 0),
  calls_made int not null default 0 check (calls_made >= 0),
  whatsapp_sent int not null default 0 check (whatsapp_sent >= 0),
  linkedin_messages_sent int not null default 0 check (linkedin_messages_sent >= 0),
  linkedin_connection_requests int not null default 0 check (linkedin_connection_requests >= 0),
  instagram_outreach int not null default 0 check (instagram_outreach >= 0),
  emails_sent int not null default 0 check (emails_sent >= 0),
  other_outreach int not null default 0 check (other_outreach >= 0),

  -- Responses
  positive_call_replies int not null default 0 check (positive_call_replies >= 0),
  positive_message_replies int not null default 0 check (positive_message_replies >= 0),

  -- Discovery calls
  discovery_calls_booked int not null default 0 check (discovery_calls_booked >= 0),
  discovery_calls_held int not null default 0 check (discovery_calls_held >= 0),
  discovery_calls_no_show int not null default 0 check (discovery_calls_no_show >= 0),

  -- Qualification
  qualified_leads int not null default 0 check (qualified_leads >= 0),
  unqualified_leads int not null default 0 check (unqualified_leads >= 0),

  -- Sales
  sales_calls_booked int not null default 0 check (sales_calls_booked >= 0),
  sales_calls_held int not null default 0 check (sales_calls_held >= 0),
  deals_closed int not null default 0 check (deals_closed >= 0),
  deals_lost int not null default 0 check (deals_lost >= 0),
  revenue numeric(12, 2) not null default 0 check (revenue >= 0),

  -- Notes
  daily_notes text,
  main_objections text,
  followups_required text,
  problems_blockers text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One report per person per day — the form upserts on this.
  unique (user_id, report_date)
);

create index daily_activity_reports_user_date_idx on daily_activity_reports (user_id, report_date);
create index daily_activity_reports_date_idx on daily_activity_reports (report_date);

create trigger daily_activity_reports_set_updated_at before update on daily_activity_reports
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- activity_events
-- Append-only log, the foundation for progressively automating reporting
-- metrics straight from CRM activity instead of manual entry (see the CRM
-- automation note in CLAUDE.md). Populated automatically today from lead
-- stage changes; nothing currently reads from it yet — that's deliberate,
-- staged follow-up work, not a half-built feature silently relied upon.
-- ---------------------------------------------------------------------------

create type activity_event_type as enum (
  'lead_created',
  'call_made',
  'whatsapp_sent',
  'linkedin_contacted',
  'email_sent',
  'lead_replied',
  'discovery_booked',
  'discovery_completed',
  'lead_qualified',
  'sales_call_booked',
  'deal_won',
  'deal_lost'
);

create table activity_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete cascade,
  user_id uuid references profiles (id) on delete set null,
  event_type activity_event_type not null,
  channel text,
  from_stage_id uuid references pipeline_stages (id) on delete set null,
  to_stage_id uuid references pipeline_stages (id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index activity_events_lead_id_idx on activity_events (lead_id);
create index activity_events_user_id_idx on activity_events (user_id);
create index activity_events_occurred_at_idx on activity_events (occurred_at);
create index activity_events_event_type_idx on activity_events (event_type);

-- Auto-populate activity_events from the existing lead-stage trigger, so
-- Lead Activity History has real data immediately without duplicating the
-- stage-change bookkeeping record_lead_stage_change() already does.
create function record_activity_event_from_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  stage_name text;
  mapped_event activity_event_type;
begin
  select name into stage_name from pipeline_stages where id = new.to_stage_id;

  mapped_event := case stage_name
    when 'Contacted' then 'call_made'
    when 'Replied' then 'lead_replied'
    when 'Discovery Call Booked' then 'discovery_booked'
    when 'Discovery Call Completed' then 'discovery_completed'
    when 'Qualified' then 'lead_qualified'
    when 'Negotiation' then 'sales_call_booked'
    when 'Won' then 'deal_won'
    when 'Lost' then 'deal_lost'
    else null
  end;

  if mapped_event is not null then
    insert into activity_events (lead_id, user_id, event_type, from_stage_id, to_stage_id, occurred_at)
    values (new.lead_id, new.changed_by, mapped_event, new.from_stage_id, new.to_stage_id, new.changed_at);
  end if;

  return new;
end;
$$;

create trigger lead_stage_history_record_activity_event
  after insert on lead_stage_history
  for each row execute function record_activity_event_from_stage_change();

-- ---------------------------------------------------------------------------
-- performance_targets
-- Optional. A row sets a target for one metric, one user (or all users when
-- user_id is null), over one period. Nothing reads this yet — dashboard
-- "Actual vs Target" display is follow-up work — but the shape is settled
-- now so it doesn't need a breaking migration later.
-- ---------------------------------------------------------------------------

create type target_metric as enum (
  'people_contacted',
  'discovery_calls_booked',
  'qualified_leads',
  'deals_closed',
  'revenue'
);

create type target_period as enum ('weekly', 'monthly');

create table performance_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  metric target_metric not null,
  period target_period not null,
  target_value numeric(12, 2) not null check (target_value >= 0),
  period_start date not null,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, metric, period, period_start)
);

create index performance_targets_user_id_idx on performance_targets (user_id);
create index performance_targets_period_start_idx on performance_targets (period_start);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table daily_activity_reports enable row level security;
alter table activity_events enable row level security;
alter table performance_targets enable row level security;

-- daily_activity_reports: a team member manages only their own reports
-- (matches "Submit own daily activity, view own activity/performance").
-- Admin sees and can edit/delete everyone's (matches "Edit/delete reports
-- where appropriate").
create policy daily_activity_reports_select_own_or_admin on daily_activity_reports
  for select to authenticated
  using (current_profile_active() and (user_id = auth.uid() or is_admin()));

create policy daily_activity_reports_insert_own on daily_activity_reports
  for insert to authenticated
  with check (current_profile_active() and user_id = auth.uid());

create policy daily_activity_reports_update_own_or_admin on daily_activity_reports
  for update to authenticated
  using (current_profile_active() and (user_id = auth.uid() or is_admin()))
  with check (current_profile_active() and (user_id = auth.uid() or is_admin()));

create policy daily_activity_reports_delete_admin on daily_activity_reports
  for delete to authenticated
  using (is_admin());

-- activity_events: read-only from the application; admins see everything,
-- team members see only events tied to their own actions. No insert policy
-- for authenticated — rows are only ever created by the security definer
-- trigger above, which bypasses RLS as its owner.
create policy activity_events_select_own_or_admin on activity_events
  for select to authenticated
  using (current_profile_active() and (user_id = auth.uid() or is_admin()));

-- performance_targets: admin manages targets; everyone can see the targets
-- that apply to them (their own, or an org-wide target with user_id null).
create policy performance_targets_select_relevant on performance_targets
  for select to authenticated
  using (current_profile_active() and (user_id = auth.uid() or user_id is null or is_admin()));

create policy performance_targets_write_admin on performance_targets
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- Grants (this Supabase project does not auto-expose new tables — see
-- 20260101000002_grants.sql for the same pattern on earlier tables).
-- ---------------------------------------------------------------------------

grant select, insert, update, delete on daily_activity_reports to authenticated;
grant select on activity_events to authenticated;
grant select, insert, update, delete on performance_targets to authenticated;
