CREATE TABLE IF NOT EXISTS users (
	user_id SERIAL PRIMARY KEY,
	ow_user_id INTEGER UNIQUE,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS groups (
	group_id SERIAL PRIMARY KEY,
	ow_group_id INTEGER UNIQUE,
	name TEXT NOT NULL UNIQUE,
	name_short TEXT NOT NULL UNIQUE,
	rules TEXT NOT NULL,
	image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
	group_id INTEGER NOT NULL references groups(group_id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL references users(user_id) ON DELETE CASCADE,
	ow_group_user_id INTEGER UNIQUE,
	active BOOLEAN DEFAULT True,
	added_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL,
	PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS punishment_types (
	punishment_type_id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	value INTEGER NOT NULL,
	logo_url TEXT NOT NULL,
	UNIQUE (group_id, name)
);

CREATE TABLE IF NOT EXISTS group_punishments (
	punishment_id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL references users(user_id) ON DELETE CASCADE,
	punishment_type_id INTEGER NOT NULL references punishment_types(punishment_type_id) ON DELETE CASCADE,  -- fix this at some point
	reason TEXT NOT NULL,
	reason_hidden BOOLEAN DEFAULT false,
	amount INTEGER NOT NULL,
	-- verified_by INTEGER references users(user_id),
	created_by INTEGER references users(user_id) ON DELETE CASCADE,
	-- verified_at TIMESTAMP WITHOUT TIME ZONE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);

CREATE TABLE IF NOT EXISTS paid_punishments_logs (
	paid_punishment_log_id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL references users(user_id) ON DELETE CASCADE,
	value INTEGER NOT NULL,
	created_by INTEGER references users(user_id) ON DELETE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);

CREATE TABLE IF NOT EXISTS group_events (
	event_id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	description TEXT NOT NULL,
	start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	created_by INTEGER NOT NULL references users(user_id) ON DELETE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);

CREATE TABLE IF NOT EXISTS punishment_reactions (
	punishment_reaction_id SERIAL PRIMARY KEY,
	punishment_id INTEGER NOT NULL references group_punishments(punishment_id) ON DELETE CASCADE,
	emoji TEXT NOT NULL,
	created_by INTEGER NOT NULL references users(user_id) ON DELETE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);
