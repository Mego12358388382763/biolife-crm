-- BioLife CRM — make lead names nullable.
--
-- Root cause of the CSV importer rejecting nearly all rows in production:
-- both the import row schema AND this table required first_name/last_name
-- to be non-empty. Real-world contact lists routinely have only a single
-- "full name" column (no distinguishable last name — this is normal for
-- many Arabic names too), or only an email/phone with no name at all. A
-- lead genuinely does not need a name to be useful if it has an email or
-- phone number.
--
-- Non-destructive: relaxes a constraint, does not touch existing data.
alter table leads alter column first_name drop not null;
alter table leads alter column last_name drop not null;

-- Keep the name search index meaningful for leads that only have one name
-- part (NULL || anything = NULL in Postgres, which would otherwise make
-- this index useless for those rows).
drop index if exists leads_name_idx;
create index leads_name_idx on leads (lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')));
