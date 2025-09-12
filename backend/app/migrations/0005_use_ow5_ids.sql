ALTER TABLE users ALTER COLUMN ow_user_id TYPE TEXT;

ALTER TABLE group_members ALTER COLUMN ow_group_user_id TYPE TEXT;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_ow_group_user_id_key;

ALTER TABLE groups ALTER COLUMN ow_group_id TYPE TEXT;
