export const PERMISSION_GROUPS = [
  { value: "group.owner", label: "Leder", canBeGiven: false },
  { value: "group.admin", label: "Administrator" },
  { value: "group.moderator", label: "Straffeansvarlig" },
  { value: "", label: "Ingen rolle" },
]

const INDEXED_PERMISSION_GROUPS: Map<string, number> = PERMISSION_GROUPS.slice()
  .reverse()
  .reduce((map, permissionGroup, index) => map.set(permissionGroup.value, index), new Map())

export const isAtLeastAsValuableRole = (targetPermissionGroup: string, currentPermissionGroup: string): boolean => {
  const targetPermissionGroupIndex = INDEXED_PERMISSION_GROUPS.get(targetPermissionGroup)
  const currentPermissionGroupIndex = INDEXED_PERMISSION_GROUPS.get(currentPermissionGroup)

  if (targetPermissionGroupIndex === undefined || currentPermissionGroupIndex === undefined) {
    return false
  }

  return targetPermissionGroupIndex <= currentPermissionGroupIndex
}

export const isLessValuableRole = (targetPermissionGroup: string, currentPermissionGroup: string): boolean => {
  const targetPermissionGroupIndex = INDEXED_PERMISSION_GROUPS.get(targetPermissionGroup)
  const currentPermissionGroupIndex = INDEXED_PERMISSION_GROUPS.get(currentPermissionGroup)

  if (targetPermissionGroupIndex === undefined || currentPermissionGroupIndex === undefined) {
    return false
  }

  return targetPermissionGroupIndex < currentPermissionGroupIndex
}
