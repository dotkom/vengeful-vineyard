export const BASE_URL = "http://localhost:8000";

export const LEADERBOARD_URL = BASE_URL + "/user/leaderboard";

export const GROUPS_URL = BASE_URL + "/group/me";

export const ADD_PUNISHMENT = BASE_URL + "/group/1/user/1/punishment";

export const getAddPunishmentUrl = (groupId: number, userId: number) =>
  `/group/${groupId}/user/${userId}/punishment`;
