CREATE TABLE IF NOT EXISTS users (
	user_id INTEGER PRIMARY KEY,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	age INTEGER NOT NULL,
	phone TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS groups (
	group_id INTEGER PRIMARY KEY,
	name TEXT NOT NULL,
	rules TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS group_members (
	group_id INTEGER NOT NULL references groups(group_id),
  user_id INTEGER NOT NULL references users(user_id),
  is_admin BOOLEAN,
  PRIMARY KEY (group_id, user_id)
);
