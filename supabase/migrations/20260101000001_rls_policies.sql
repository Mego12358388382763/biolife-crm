-- BioLife CRM — Row Level Security policies
-- Roles: admin (full access + user/system management), growth_operations
-- (create/edit leads, companies, pipeline, tasks — no system config, no hard
-- delete of protected data), read_only (select only).
--
-- Authorization is enforced here at the database level. The application UI
-- may additionally hide controls, but must never rely on that alone.

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so they can read `profiles` without
-- being subject to the RLS policies defined below, avoiding recursion).
-- ---------------------------------------------------------------------------

create function current_profile_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create function current_profile_active()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select active from profiles where id = auth.uid()), false);
$$;

create function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select current_profile_active() and current_profile_role() = 'admin';
$$;

create function can_write()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select current_profile_active() and current_profile_role() in ('admin', 'growth_operations');
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table companies enable row level security;
alter table pipeline_stages enable row level security;
alter table leads enable row level security;
alter table lead_stage_history enable row level security;
alter table tasks enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- Everyone authenticated can read profiles (needed for "assigned to" UI).
-- Only admins can change role/active/create/delete. Users may update their
-- own non-sensitive fields (full_name).
-- ---------------------------------------------------------------------------

create policy profiles_select_authenticated on profiles
  for select to authenticated
  using (true);

create policy profiles_update_admin on profiles
  for update to authenticated
  using (is_admin())
  with check (is_admin());

create policy profiles_update_self on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Guard: non-admins updating their own row cannot change role/active/email.
create function protect_profile_sensitive_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.role is distinct from old.role
      or new.active is distinct from old.active
      or new.email is distinct from old.email then
      raise exception 'Only admins may change role, active, or email on a profile';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_sensitive_fields
  before update on profiles
  for each row execute function protect_profile_sensitive_fields();

-- No insert/delete policies: profiles are provisioned exclusively by the
-- handle_new_user() trigger (security definer) and never deleted directly.

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------

create policy companies_select_authenticated on companies
  for select to authenticated
  using (current_profile_active());

create policy companies_insert_writers on companies
  for insert to authenticated
  with check (can_write());

create policy companies_update_writers on companies
  for update to authenticated
  using (can_write())
  with check (can_write());

-- Only admins may hard-delete (not used by the app; soft delete is the norm).
create policy companies_delete_admin on companies
  for delete to authenticated
  using (is_admin());

-- Guard: only admins may soft-delete (set deleted_at) — growth_operations
-- cannot permanently or semi-permanently remove protected CRM data.
create function protect_soft_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.deleted_at is distinct from old.deleted_at and not is_admin() then
    raise exception 'Only admins may delete records';
  end if;
  return new;
end;
$$;

create trigger companies_protect_soft_delete
  before update on companies
  for each row execute function protect_soft_delete();

-- ---------------------------------------------------------------------------
-- pipeline_stages
-- Database-driven, system-level configuration: read by everyone, writable
-- only by admins.
-- ---------------------------------------------------------------------------

create policy pipeline_stages_select_authenticated on pipeline_stages
  for select to authenticated
  using (true);

create policy pipeline_stages_write_admin on pipeline_stages
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

create policy leads_select_authenticated on leads
  for select to authenticated
  using (current_profile_active());

create policy leads_insert_writers on leads
  for insert to authenticated
  with check (can_write());

create policy leads_update_writers on leads
  for update to authenticated
  using (can_write())
  with check (can_write());

create policy leads_delete_admin on leads
  for delete to authenticated
  using (is_admin());

create trigger leads_protect_soft_delete
  before update on leads
  for each row execute function protect_soft_delete();

-- ---------------------------------------------------------------------------
-- lead_stage_history
-- Append-only audit log, populated by the record_lead_stage_change()
-- trigger (security definer). Readable by all authenticated users; no
-- direct client-side insert/update/delete.
-- ---------------------------------------------------------------------------

create policy lead_stage_history_select_authenticated on lead_stage_history
  for select to authenticated
  using (current_profile_active());

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------

create policy tasks_select_authenticated on tasks
  for select to authenticated
  using (current_profile_active());

create policy tasks_insert_writers on tasks
  for insert to authenticated
  with check (can_write());

create policy tasks_update_writers on tasks
  for update to authenticated
  using (can_write())
  with check (can_write());

create policy tasks_delete_admin on tasks
  for delete to authenticated
  using (is_admin());

create trigger tasks_protect_soft_delete
  before update on tasks
  for each row execute function protect_soft_delete();
