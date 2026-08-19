-- BioLife CRM — admin delete support + full operational-data reset.
--
-- lead_stage_history previously had no DELETE policy at all (select-only).
-- Deleting a lead cascades (on delete cascade) to its history rows, and
-- Postgres RLS applies to cascaded deletes exactly as if the deleting
-- session had issued them directly — so without this policy, any admin
-- deleting a lead with history (i.e. almost every lead, since a history row
-- is recorded automatically on creation) would hit a silent RLS denial and
-- the whole DELETE would fail. Add the missing policy, matching the
-- *_delete_admin pattern already used on companies/leads/tasks.
create policy lead_stage_history_delete_admin on lead_stage_history
  for delete to authenticated
  using (is_admin());

--
-- Deletes all leads, companies, tasks, and lead stage history in a single
-- transaction (a plpgsql function body is atomic: any failure rolls back
-- the whole thing, leaving no partially-deleted state). Preserves
-- profiles, pipeline_stages, and all schema/config — this returns the CRM
-- to a "just installed" state, not a blank database.
--
-- Authorization is enforced here, inside the function, not only in the
-- calling application: only an active admin may invoke it, checked via the
-- existing is_admin() helper from the RLS migration. security definer lets
-- the deletes bypass row-level policies (which otherwise disallow deleting
-- companies), while the explicit is_admin() check is what actually gates
-- who can run it.

create or replace function reset_crm_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'Only admins may reset CRM data';
  end if;

  delete from lead_stage_history;
  delete from tasks;
  delete from leads;
  delete from companies;
end;
$$;

revoke all on function reset_crm_data() from public;
grant execute on function reset_crm_data() to authenticated;
