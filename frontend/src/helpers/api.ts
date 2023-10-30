export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export const getGroupLeaderboardUrl = (groupId: number) => BASE_URL + `/group/${groupId}`

export const LEADERBOARD_URL = BASE_URL + "/user/leaderboard"

export const getMeUrl = (optimistic: boolean) => BASE_URL + `/user/me?optimistic=${optimistic}`

export const GROUPS_URL = BASE_URL + "/group/me"

export const ADD_PUNISHMENT = BASE_URL + "/group/1/user/1/punishment"

export const getAddPunishmentUrl = (groupId: number, userId: number) =>
  BASE_URL + `/group/${groupId}/user/${userId}/punishment`

export const getAddReactionUrl = (punishmentId: number) => BASE_URL + `/punishment/${punishmentId}/reaction`
