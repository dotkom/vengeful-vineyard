ALTER TABLE group_members ADD COLUMN inactive_at TIMESTAMP WITHOUT TIME ZONE;

UPDATE group_members SET inactive_at = now() at time zone 'utc' WHERE active = FALSE AND inactive_at IS NULL;
