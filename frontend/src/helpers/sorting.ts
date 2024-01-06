import { Group, GroupUser, PunishmentType } from "./types"

export const groupMembersSortAlternatives = ["total_punishments", "total_value"] as const

export type GroupMembersSortAlternative = (typeof groupMembersSortAlternatives)[number]

export function sortGroups(groups: Group[]) {
  return groups.sort((a, b) => {
    const aIsOwGroup = a.ow_group_id !== null
    const bIsOwGroup = b.ow_group_id !== null

    if (aIsOwGroup && !bIsOwGroup) {
      return -1
    }
    if (!aIsOwGroup && bIsOwGroup) {
      return 1
    }

    return a.name_short.localeCompare(b.name_short)
  })
}

export function sortGroupUsersByName(users: GroupUser[]) {
  return users.sort((a, b) => {
    if (a.first_name === b.first_name) {
      return a.last_name.localeCompare(b.last_name)
    }
    return a.first_name.localeCompare(b.first_name)
  })
}

export function getSortGroupUsersFunc(
  punishmentMap: Map<string, PunishmentType>,
  sortAlternative?: GroupMembersSortAlternative
) {
  return (a: GroupUser, b: GroupUser): number => {
    sortAlternative = sortAlternative ?? "total_punishments"

    if (sortAlternative === "total_punishments") {
      const count_punishments = (user: GroupUser) =>
        user.punishments.reduce((acc, curr) => (punishmentMap.has(curr.punishment_type_id) ? acc + curr.amount : 0), 0)

      const a_punishments = count_punishments(a)
      const b_punishments = count_punishments(b)

      if (a_punishments !== b_punishments) {
        return b_punishments - a_punishments
      }
    }

    const value_punishments = (user: GroupUser) =>
      user.punishments.reduce(
        (acc, curr) => acc + curr.amount * (punishmentMap.get(curr.punishment_type_id)?.value ?? 0),
        0
      )

    const a_value = value_punishments(a)
    const b_value = value_punishments(b)

    if (a_value !== b_value) {
      return b_value - a_value
    }

    if (a.first_name === b.first_name) {
      return a.last_name.localeCompare(b.last_name)
    }
    return a.first_name.localeCompare(b.first_name)
  }
}

export function sortGroupUsers(members: GroupUser[], punishmentTypes: PunishmentType[]) {
  const punishmentMap = new Map(punishmentTypes.map((pt) => [pt.punishment_type_id, pt]))
  return members.sort(getSortGroupUsersFunc(punishmentMap))
}
