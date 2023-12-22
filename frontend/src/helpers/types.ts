export interface User {
  ow_user_id: number
  user_id: string
  first_name: string
  last_name: string
  email: string
}

export interface MeUser extends User {
  groups: Group[]
}

export interface Leaderboard {
  total: number
  next: string
  previous: string
  results: LeaderboardUser[]
}

export interface LeaderboardPunishment extends Punishment {
  group_id: null
  punishment_type: PunishmentType
}

export interface LeaderboardUser extends User {
  total_value: number
  punishments: LeaderboardPunishment[]
}

export interface PunishmentReaction {
  punishment_reaction_id: string
  punishment_id: string
  created_by: string
  created_at: string
  emoji: string
}

export interface PunishmentCreate {
  punishment_type_id: string
  reason: string
  reason_hidden: boolean
  amount: number
}

export interface Punishment {
  punishment_type_id: string
  group_id: string | null // null if the punishment is for wall of shame
  reason: string
  reason_hidden: boolean
  amount: number
  punishment_id: string
  created_at: string
  created_by: string
  created_by_name: string
  paid: boolean
  paid_at: string
  marked_paid_by: string
  reactions: PunishmentReaction[]
}

export interface PunishmentType {
  name: string
  value: number
  logo_url: string
  punishment_type_id: string
}

export interface Group {
  name: string
  name_short: string
  rules: string
  ow_group_id: number
  image: string
  group_id: string
  punishment_types: PunishmentType[]
  members: GroupUser[]
}

export interface GroupUser extends User {
  group_id: string
  ow_group_user_id: number
  punishments: Punishment[]
  active: boolean
}

export interface PunishmentStreaks {
  current_streak: number
  longest_streak: number
  current_inverse_streak: number
  longest_inverse_streak: number
}
