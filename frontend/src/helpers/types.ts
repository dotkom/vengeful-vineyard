export interface User {
  ow_user_id: number
  user_id: number
  first_name: string
  last_name: string
  email: string
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

export interface LeaderboardUser {
  ow_user_id: number
  first_name: string
  last_name: string
  email: string
  user_id: number
  total_value: number
  punishments: LeaderboardPunishment[]
}

export interface PunishmentReaction {
  punishment_reaction_id: number
  punishment_id: number
  created_by: number
  created_at: string
  emoji: string
}

export interface PunishmentCreate {
  punishment_type_id: number
  reason: string
  reason_hidden: boolean
  amount: number
}

export interface Punishment {
  punishment_type_id: number
  group_id: number | null // null if the punishment is for wall of shame
  reason: string
  reason_hidden: boolean
  amount: number
  punishment_id: number
  created_at: string
  created_by: number
  created_by_name: string
  paid: boolean
  paid_at: string
  marked_paid_by: number
  reactions: PunishmentReaction[]
}

export interface PunishmentType {
  name: string
  value: number
  logo_url: string
  punishment_type_id: number
}

export interface Group {
  name: string
  name_short: string
  rules: string
  ow_group_id: number
  image: string
  group_id: number
  punishment_types: PunishmentType[]
  members: GroupUser[]
}

export interface GroupUser {
  ow_user_id: number
  first_name: string
  last_name: string
  email: string
  user_id: number
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
