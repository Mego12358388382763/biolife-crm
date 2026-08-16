-- BioLife CRM — development seed data.
-- Run automatically by `supabase db reset`, or manually with:
--   supabase db execute -f supabase/seed.sql
--
-- Creates the two known Phase 1 users (Ahmed as admin, Houda as growth &
-- operations) plus a handful of sample companies/leads/tasks so the UI has
-- something to show during development. No real passwords are stored here —
-- accounts are created via Supabase Auth's admin API with a placeholder
-- development password that must be changed before any non-local use.

-- ---------------------------------------------------------------------------
-- Users (auth.users + profiles via the handle_new_user() trigger)
-- ---------------------------------------------------------------------------

do $$
declare
  ahmed_id uuid := 'a1000000-0000-0000-0000-000000000001';
  houda_id uuid := 'a1000000-0000-0000-0000-000000000002';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000', ahmed_id, 'authenticated', 'authenticated',
    'ahmed@biolifehealth.co.uk', crypt('DevPassword123!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmed Salem","role":"admin"}',
    '', '', '', '', '', '', '', '',
    now(), now()
  ) on conflict (id) do nothing;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000', houda_id, 'authenticated', 'authenticated',
    'houda@biolifehealth.co.uk', crypt('DevPassword123!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Houda Ashraf","role":"growth_operations"}',
    '', '', '', '', '', '', '', '',
    now(), now()
  ) on conflict (id) do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- Sample companies
-- ---------------------------------------------------------------------------

insert into companies (id, name, website, industry, country, city, company_size, created_by)
values
  ('b1000000-0000-0000-0000-000000000001', 'Nova Wellness Group', 'https://novawellness.example.com', 'Health & Wellness', 'United Kingdom', 'London', '11-50', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'Horizon Corporate Health', 'https://horizoncorp.example.com', 'Corporate Wellness', 'United Kingdom', 'Manchester', '51-200', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'Pulse Fitness Studios', 'https://pulsefitness.example.com', 'Fitness', 'United Arab Emirates', 'Dubai', '1-10', 'a1000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample leads (pipeline_stage_id looked up by name since stage ids are
-- generated at migration time)
-- ---------------------------------------------------------------------------

insert into leads (
  id, first_name, last_name, job_title, company_id, email, phone, country, city,
  source, pipeline_stage_id, assigned_to, lead_score, temperature, next_follow_up_at,
  created_by
)
select
  v.id::uuid, v.first_name, v.last_name, v.job_title, v.company_id::uuid, v.email, v.phone, v.country, v.city,
  v.source, ps.id, v.assigned_to::uuid, v.lead_score, v.temperature::lead_temperature, v.next_follow_up_at,
  v.created_by::uuid
from (
  values
    ('c1000000-0000-0000-0000-000000000001', 'Sarah', 'Khan', 'Head of People', 'b1000000-0000-0000-0000-000000000001', 'sarah.khan@novawellness.example.com', '+44 7700 900001', 'United Kingdom', 'London', 'LinkedIn', 'New', 'a1000000-0000-0000-0000-000000000002', 40, 'warm', now() + interval '2 days', 'a1000000-0000-0000-0000-000000000002'),
    ('c1000000-0000-0000-0000-000000000002', 'James', 'Oduya', 'Operations Director', 'b1000000-0000-0000-0000-000000000002', 'james.oduya@horizoncorp.example.com', '+44 7700 900002', 'United Kingdom', 'Manchester', 'Referral', 'Contacted', 'a1000000-0000-0000-0000-000000000002', 65, 'hot', now() + interval '1 day', 'a1000000-0000-0000-0000-000000000002'),
    ('c1000000-0000-0000-0000-000000000003', 'Fatima', 'Al Marri', 'Founder', 'b1000000-0000-0000-0000-000000000003', 'fatima@pulsefitness.example.com', '+971 50 900 0003', 'United Arab Emirates', 'Dubai', 'Website', 'Qualified', 'a1000000-0000-0000-0000-000000000001', 80, 'hot', now() + interval '3 days', 'a1000000-0000-0000-0000-000000000001')
) as v(id, first_name, last_name, job_title, company_id, email, phone, country, city, source, stage_name, assigned_to, lead_score, temperature, next_follow_up_at, created_by)
join pipeline_stages ps on ps.name = v.stage_name
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample tasks
-- ---------------------------------------------------------------------------

insert into tasks (title, description, lead_id, assigned_to, priority, status, due_at, created_by)
values
  ('Send discovery call invite', 'Share available slots for a 30-min discovery call.', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'high', 'pending', now() + interval '1 day', 'a1000000-0000-0000-0000-000000000002'),
  ('Follow up on proposal questions', 'Fatima asked about enterprise pricing tiers.', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'urgent', 'pending', now() - interval '1 day', 'a1000000-0000-0000-0000-000000000001'),
  ('Initial outreach follow-up', 'First touch after LinkedIn connection.', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'medium', 'pending', now() + interval '2 days', 'a1000000-0000-0000-0000-000000000002')
on conflict do nothing;
