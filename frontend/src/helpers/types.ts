export interface User {
  ow_user_id: number
  user_id: string
  first_name: string
  last_name: string
  email: string
}

export interface MeUser extends User {
  groups: Group[]
  invites: GroupInviteWithMetadata[]
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
  emoji: string
  punishment_type_id: string
}

export interface GroupBase {
  name: string
  name_short: string
  rules: string
  image: string
  ow_group_id: number
  group_id: string
}

export type GroupRole = [string, string]
export type GroupPermissions = Record<string, string[]>

export interface GroupInviteBase {
  group_id: string
  user_id: string
}

export interface GroupInviteCreate extends GroupInviteBase {}

export interface GroupInvite extends GroupInviteBase {
  created_at: string
}

export interface GroupInviteWithMetadata {
  invite: GroupInvite
  created_by_name: string
  group_name: string
}

export interface Group extends GroupBase {
  punishment_types: PunishmentType[]
  members: GroupUser[]
  invites: GroupInvite[]
  roles: GroupRole[]
  permissions: GroupPermissions
}

export interface GroupUser extends User {
  group_id: string
  ow_group_user_id: number
  punishments: Punishment[]
  active: boolean
  permissions: string[]
}

export interface PunishmentStreaks {
  current_streak: number
  longest_streak: number
  current_inverse_streak: number
  longest_inverse_streak: number
}
