export interface Leaderboard {
  total: number;
  next: string;
  previous: string;
  results: LeaderboardUser[];
}

export interface LeaderboardUser {
  ow_user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_id: number;
  total_value: number;
  punishments: Punishment[];
}

export interface Punishment {
  punishment_type_id: number;
  reason: string;
  reason_hidden: boolean;
  amount: number;
  punishment_id: number;
  created_at: string;
  created_by: number;
  verified_at: string;
  verified_by: number;
}

export interface User {
  ow_user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_id: number;
}

export interface Group {
  name: string;
  name_short: string;
  rules: string;
  ow_group_id: number;
  image: string;
  group_id: number;
  punishment_types: {
    name: string;
    value: number;
    logo_url: string;
    punishment_type_id: number;
  }[];
  members: GroupUser[];
}

export interface GroupUser {
  ow_user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_id: number;
  ow_group_user_id: number;
  punishments: Punishment[];
  active: boolean;
}

export interface PunishmentStreaks {
  current_streak: number;
  longest_streak: number;
  current_inverse_streak: number;
  longest_inverse_streak: number;
}
