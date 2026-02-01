import { z } from "zod"

export const PaginatedResponseSchemaBase = z.object({
  total: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
})

export const UserSchema = z.object({
  ow_user_id: z.string(),
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
})
export type User = z.infer<typeof UserSchema>

export const PunishmentTypeSchema = z.object({
  name: z.string(),
  value: z.number(),
  emoji: z.string(),
  punishment_type_id: z.string(),
})
export type PunishmentType = z.infer<typeof PunishmentTypeSchema>

export const PunishmentReactionSchema = z.object({
  punishment_reaction_id: z.string(),
  punishment_id: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  created_by_name: z.string(),
  emoji: z.string(),
})
export type PunishmentReaction = z.infer<typeof PunishmentReactionSchema>

export const PunishmentSchema = z.object({
  punishment_type_id: z.string(),
  group_id: z.string().nullable(),
  reason: z.string(),
  reason_hidden: z.boolean(),
  amount: z.number(),
  punishment_id: z.string(),
  created_at: z.string(),
  created_by: z.string(),
  created_by_name: z.string(),
  paid: z.boolean(),
  paid_at: z.string().nullable(),
  marked_paid_by: z.string().nullable(),
  reactions: z.array(PunishmentReactionSchema),
})
export type Punishment = z.infer<typeof PunishmentSchema>

export const GroupUserSchema = UserSchema.extend({
  group_id: z.string(),
  ow_group_user_id: z.string().nullable(),
  punishments: z.array(PunishmentSchema),
  active: z.boolean(),
  inactive_at: z.string().nullable(),
  permissions: z.array(z.string()),
})
export type GroupUser = z.infer<typeof GroupUserSchema>

export const GroupBaseSchema = z.object({
  name: z.string(),
  name_short: z.string(),
  rules: z.string(),
  image: z.string(),
  ow_group_id: z.string().nullable(),
  group_id: z.string(),
})
export type GroupBase = z.infer<typeof GroupBaseSchema>

export const PublicGroupSchema = z.object({
  name: z.string(),
  name_short: z.string(),
  image: z.string(),
  group_id: z.string(),
  is_official: z.boolean(),
  invite_code: z.string().nullable(),
})

export type PublicGroup = z.infer<typeof PublicGroupSchema>

export const GroupSchema = GroupBaseSchema.extend({
  punishment_types: z.record(z.string(), PunishmentTypeSchema),
  members: z.array(GroupUserSchema),
  join_requests: z.array(UserSchema),
  roles: z.array(z.tuple([z.string(), z.string()])),
  permissions: z.record(z.array(z.string())),
  invite_code: z.string().nullable().optional(),
})

export type GroupPermissions = Record<string, string[]>
export type GroupRole = [string, string]
export type Group = z.infer<typeof GroupSchema & { permissions: GroupPermissions; roles: GroupRole[] }>

export const LeaderboardPunishmentSchema = PunishmentSchema.extend({
  punishment_type: PunishmentTypeSchema,
})
export type LeaderboardPunishment = z.infer<typeof LeaderboardPunishmentSchema>

export const LeaderboardUserSchema = UserSchema.extend({
  total_value: z.number(),
  emojis: z.string(),
  amount_punishments: z.number(),
  amount_unique_punishments: z.number(),
  total_value_this_year: z.number(),
  emojis_this_year: z.string(),
  amount_punishments_this_year: z.number(),
  amount_unique_punishments_this_year: z.number(),
})
export type LeaderboardUser = z.infer<typeof LeaderboardUserSchema>

export const MeUserSchema = UserSchema.extend({
  groups: z.array(GroupSchema),
})
export type MeUser = z.infer<typeof MeUserSchema>

export const LeaderboardSchema = PaginatedResponseSchemaBase.extend({
  results: z.array(LeaderboardUserSchema),
})
export type Leaderboard = z.infer<typeof LeaderboardSchema>

export const LogPunishmentSchema = PunishmentSchema.extend({
  punishment_type: PunishmentTypeSchema,
  user: UserSchema,
  group_name: z.string(),
})
export type LogPunishment = z.infer<typeof LogPunishmentSchema>

export const PunishmentsLogSchema = PaginatedResponseSchemaBase.extend({
  results: z.array(LogPunishmentSchema),
})
export type PunishmentsLog = z.infer<typeof PunishmentsLogSchema>

export const PunishmentCreateSchema = z.object({
  punishment_type_id: z.string(),
  reason: z.string(),
  reason_hidden: z.boolean(),
  amount: z.number(),
})
export type PunishmentCreate = z.infer<typeof PunishmentCreateSchema>

export const GroupStatisticsSchema = z.object({
  group_id: z.string(),
  group_image: z.string(),
  group_name: z.string(),
  group_name_short: z.string(),
  total_count: z.number(),
  total_unpaid_value: z.number(),
  total_value: z.number(),
  total_value_this_year: z.number(),
})
export type GroupStatistics = z.infer<typeof GroupStatisticsSchema>

export const PunishmentStreaksSchema = z.object({
  current_streak: z.number(),
  longest_streak: z.number(),
  current_inverse_streak: z.number(),
  longest_inverse_streak: z.number(),
})
export type PunishmentStreaks = z.infer<typeof PunishmentStreaksSchema>

export const GroupCreate = z.object({
  name: z.string().trim().min(3, { message: "Navn må være minst tre tegn" }),
  name_short: z.string().trim().min(3, { message: "Kort navn må være minst tre tegn" }),
})

export type GroupCreateType = z.infer<typeof GroupCreate>

export const EditGroup = z.object({
  name: z.string().trim().min(3, { message: "Navn må være minst tre tegn" }),
  name_short: z.string().trim().min(3, { message: "Kort navn må være minst tre tegn" }),
})

export type EditGroupType = z.infer<typeof EditGroup>

export const MutatePunishment = z.object({
  name: z.string().trim().min(3, { message: "Navn må være minst tre tegn" }),
  emoji: z.string().trim().min(1, { message: "Emoji må være minst ett tegn" }),
  value: z.number().min(1, { message: "Verdi må være minst 1" }),
})

export type MutatePunishmentType = z.infer<typeof MutatePunishment>
