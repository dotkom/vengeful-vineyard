PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
	user_id INTEGER PRIMARY KEY,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS groups (
	group_id INTEGER PRIMARY KEY,
	name TEXT NOT NULL UNIQUE,
	rules TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
	group_id INTEGER NOT NULL references groups(group_id),
  user_id INTEGER NOT NULL references users(user_id),
  is_admin BOOLEAN DEFAULT False,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS punishment_types (
	punishment_type_id INTEGER PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id),
	name TEXT NOT NULL,
  value INTEGER NOT NULL,
  logo_url TEXT NOT NULL,
  UNIQUE (group_id, name)
);

CREATE TABLE IF NOT EXISTS group_punishments (
	punishment_id INTEGER PRIMARY KEY,
	group_id INTEGER NOT NULL references groups(group_id),
	user_id INTEGER NOT NULL references users(user_id),
	punishment_type INTEGER NOT NULL references punishment_types(user_id)
);
