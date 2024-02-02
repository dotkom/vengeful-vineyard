CREATE TABLE IF NOT EXISTS group_invites (
	group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL,
    created_by uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	PRIMARY KEY (group_id, user_id)
);

DROP TABLE IF EXISTS group_join_requests;