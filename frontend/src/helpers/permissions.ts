import { GroupPermissions, GroupRole } from "./types"

export const hasPermission = (
  permissions: GroupPermissions,
  targetPermission: string,
  currentPermission: string
): boolean => {
  if (targetPermission === "ALWAYS") {
    return true
  } else if (targetPermission === "NEVER") {
    return false
  }

  if (targetPermission === currentPermission) {
    return false
  }

  let permission = permissions[targetPermission]
  while (permission) {
    if (permission.includes(currentPermission) || permission.includes("ALWAYS")) {
      return true
    }

    permission = permissions[permission[0]]
  }

  return false
}

export const canGiveRole = (
  roles: GroupRole[],
  permissions: GroupPermissions,
  targetRole: string,
  currentRole: string
): boolean => {
  if (targetRole === currentRole) {
    return false
  }

  const foundTargetRole = roles.find(([_, role]) => role === targetRole)

  if (!foundTargetRole) {
    return false
  }

  const foundCurrentRole = roles.find(([_, role]) => role === currentRole)

  if (!foundCurrentRole) {
    return false
  }

  if (foundTargetRole[1] === "" && hasPermission(permissions, "group.members.manage", foundCurrentRole[1])) {
    return true
  }

  return hasPermission(permissions, targetRole, currentRole)
}
