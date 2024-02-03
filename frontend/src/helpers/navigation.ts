import { MeUser } from "./types"

export const getFallbackNavigationUrl = (meUser: MeUser | undefined) => {
  if (meUser === undefined || meUser.groups.length === 0) {
    return "/"
  } else {
    return `/komiteer/${meUser.groups[0].name_short}`
  }
}
