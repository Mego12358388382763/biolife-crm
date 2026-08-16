-- BioLife CRM — Initial schema (Phase 1 foundation)
-- Roles, profiles, companies, leads, pipeline stages, lead stage history, tasks.
-- Soft deletion is used throughout; hard deletes are avoided to preserve CRM history.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('admin', 'growth_operations', 'read_only');
create type lead_temperature as enum ('hot', 'warm', 'cold');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status as enum ('pending', 'in_progress', 'completed', 'cancelled');

-- ---------------------------------------------------------------------------
-- profiles
-- One row per authenticated user, mirrors auth.users. Created automatically
-- by a trigger on auth.users insert (see below).
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'read_only',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'CRM user profiles, one per auth.users row.';

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text,
  country text,
  city text,
  company_size text,
  notes text,
  created_by uuid references profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_created_by_idx on companies (created_by);
create index companies_name_idx on companies (lower(name));
create index companies_deleted_at_idx on companies (deleted_at);

-- ---------------------------------------------------------------------------
-- pipeline_stages
-- Database-driven pipeline. Application code must never hardcode stage
-- names/logic — always join against this table.
-- ---------------------------------------------------------------------------

create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position int not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

create table leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  job_title text,
  company_id uuid references companies (id) on delete set null,
  email text,
  phone text,
  whatsapp text,
  linkedin_url text,
  country text,
  city text,
  source text,
  status text not null default 'active',
  pipeline_stage_id uuid not null references pipeline_stages (id) on delete restrict,
  assigned_to uuid references profiles (id) on delete set null,
  lead_score int not null default 0 check (lead_score between 0 and 100),
  temperature lead_temperature not null default 'cold',
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_by uuid references profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_company_id_idx on leads (company_id);
create index leads_pipeline_stage_id_idx on leads (pipeline_stage_id);
create index leads_assigned_to_idx on leads (assigned_to);
create index leads_next_follow_up_at_idx on leads (next_follow_up_at);
create index leads_deleted_at_idx on leads (deleted_at);
create index leads_name_idx on leads (lower(first_name || ' ' || last_name));
create unique index leads_email_unique_idx on leads (lower(email)) where email is not null and deleted_at is null;

-- ---------------------------------------------------------------------------
-- lead_stage_history
-- Append-only audit trail. Every pipeline stage change must insert a row.
-- ---------------------------------------------------------------------------

create table lead_stage_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  from_stage_id uuid references pipeline_stages (id) on delete set null,
  to_stage_id uuid not null references pipeline_stages (id) on delete restrict,
  changed_by uuid references profiles (id) on delete set null,
  changed_at timestamptz not null default now()
);

create index lead_stage_history_lead_id_idx on lead_stage_history (lead_id);
create index lead_stage_history_changed_at_idx on lead_stage_history (changed_at);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  lead_id uuid references leads (id) on delete cascade,
  assigned_to uuid references profiles (id) on delete set null,
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_lead_id_idx on tasks (lead_id);
create index tasks_assigned_to_idx on tasks (assigned_to);
create index tasks_due_at_idx on tasks (due_at);
create index tasks_status_idx on tasks (status);
create index tasks_deleted_at_idx on tasks (deleted_at);

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger
-- ---------------------------------------------------------------------------

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger companies_set_updated_at before update on companies
  for each row execute function set_updated_at();
create trigger leads_set_updated_at before update on leads
  for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- auth.users -> profiles provisioning trigger
-- ---------------------------------------------------------------------------

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'read_only')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- lead_stage_history auto-recording trigger
-- Guarantees every pipeline_stage_id change is recorded, even if application
-- code forgets to insert a history row explicitly.
-- ---------------------------------------------------------------------------

create function record_lead_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    insert into lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by)
    values (new.id, null, new.pipeline_stage_id, new.created_by);
  elsif (tg_op = 'UPDATE' and new.pipeline_stage_id is distinct from old.pipeline_stage_id) then
    insert into lead_stage_history (lead_id, from_stage_id, to_stage_id, changed_by)
    values (new.id, old.pipeline_stage_id, new.pipeline_stage_id, auth.uid());
  end if;
  return new;
end;
$$;

create trigger leads_record_stage_change
  after insert or update on leads
  for each row execute function record_lead_stage_change();

-- ---------------------------------------------------------------------------
-- Seed pipeline stages (fixed reference data, not environment-specific)
-- ---------------------------------------------------------------------------

insert into pipeline_stages (name, position) values
  ('New', 1),
  ('Researching', 2),
  ('Contacted', 3),
  ('Follow-up', 4),
  ('Replied', 5),
  ('Qualified', 6),
  ('Discovery Call Booked', 7),
  ('Discovery Call Completed', 8),
  ('Proposal Sent', 9),
  ('Negotiation', 10),
  ('Won', 11),
  ('Lost', 12);
