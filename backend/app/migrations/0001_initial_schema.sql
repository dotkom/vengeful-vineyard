CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	ow_user_id INTEGER UNIQUE,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	email TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS groups (
	group_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	ow_group_id INTEGER UNIQUE,
	name TEXT NOT NULL UNIQUE,
	name_short TEXT NOT NULL,
	rules TEXT NOT NULL,
	image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
	group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	ow_group_user_id INTEGER UNIQUE,
	active BOOLEAN DEFAULT True,
	added_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL,
	PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS punishment_types (
	punishment_type_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
	name TEXT NOT NULL,
	value INTEGER NOT NULL,
	logo_url TEXT NOT NULL,
	UNIQUE (group_id, name)
);

CREATE TABLE IF NOT EXISTS group_punishments (
	punishment_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	punishment_type_id uuid NOT NULL references punishment_types(punishment_type_id) ON DELETE CASCADE ON UPDATE CASCADE,  -- fix this at some point
	reason TEXT NOT NULL,
	reason_hidden BOOLEAN DEFAULT false,
	amount INTEGER NOT NULL,
	created_by uuid references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL,
	paid BOOLEAN DEFAULT false,
	paid_at TIMESTAMP WITHOUT TIME ZONE,
	marked_paid_by uuid references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS group_events (
	event_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
	name TEXT NOT NULL,
	description TEXT NOT NULL,
	start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	created_by uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);

CREATE TABLE IF NOT EXISTS punishment_reactions (
	punishment_reaction_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	punishment_id uuid NOT NULL references group_punishments(punishment_id) ON DELETE CASCADE ON UPDATE CASCADE,
	emoji TEXT NOT NULL,
	created_by uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);

CREATE TABLE IF NOT EXISTS group_member_permissions (
	group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
	user_id uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	privilege varchar(255) NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL,
	created_by uuid references users(user_id) ON DELETE SET null ON UPDATE CASCADE,
	PRIMARY KEY (group_id, user_id, privilege)
);

CREATE UNIQUE INDEX IF NOT EXISTS groups_short_name_idx ON groups (LOWER(name_short));
