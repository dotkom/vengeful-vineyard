CREATE TABLE IF NOT EXISTS versus_bet (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    creator_user_id uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    creator_group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
    other_user_id uuid NOT NULL references users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    other_group_id uuid NOT NULL references groups(group_id) ON DELETE CASCADE ON UPDATE CASCADE,
    punishment_type_id uuid NOT NULL references punishment_types(punishment_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
    amount INTEGER NOT NULL,
    winner_user_id uuid references users(user_id) ON DELETE SET null ON UPDATE CASCADE,
    accepted_at TIMESTAMP WITHOUT TIME ZONE,
    settled_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') NOT NULL
);