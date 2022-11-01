CREATE TABLE IF NOT EXISTS users (
	user_id SERIAL PRIMARY KEY,
	ow_user_id INTEGER UNIQUE,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT
);

CREATE TABLE IF NOT EXISTS groups (
	group_id SERIAL PRIMARY KEY,
	ow_group_id INTEGER UNIQUE,
	name TEXT NOT NULL UNIQUE,
	name_short TEXT,
	rules TEXT NOT NULL,
	image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
	group_id INTEGER NOT NULL references groups(group_id),
	user_id INTEGER NOT NULL references users(user_id),
	ow_group_user_id INTEGER UNIQUE,
	active BOOLEAN DEFAULT True,
	PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS punishment_types (
	punishment_type_id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id),
	name TEXT NOT NULL,
	value INTEGER NOT NULL,
	logo_url TEXT NOT NULL,
	UNIQUE (group_id, name)
);

CREATE TABLE IF NOT EXISTS group_punishments (
	punishment_id SERIAL PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id),
	user_id INTEGER NOT NULL references users(user_id),
	punishment_type_id INTEGER NOT NULL references punishment_types(punishment_type_id),
	reason TEXT NOT NULL,
	amount INTEGER NOT NULL,
	verified_by INTEGER references users(user_id),
	created_by INTEGER references users(user_id),
	verified_time TIMESTAMP WITHOUT TIME ZONE,
	created_time TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
);
