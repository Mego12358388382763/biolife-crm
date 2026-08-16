-- BioLife CRM — base table grants.
-- RLS policies (20260101000001) restrict which ROWS a role can see/change,
-- but Postgres also requires an explicit GRANT before a role may attempt the
-- operation at all. This project's local config does not auto-expose new
-- tables (the current Supabase default), so grants must be explicit here.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  profiles, companies, pipeline_stages, leads, lead_stage_history, tasks
  to authenticated;

grant select on pipeline_stages to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
