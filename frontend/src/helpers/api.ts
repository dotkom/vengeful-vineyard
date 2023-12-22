import { Group, Leaderboard, MeUser, PunishmentCreate } from "./types"
import axios, { AxiosResponse } from "axios"
import { sortGroupUsers, sortGroups } from "./sorting"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { useOptimisticQuery } from "./optimisticQuery"

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export const LEADERBOARD_URL = BASE_URL + "/user/leaderboard"

export const getMeUrl = (optimistic: boolean) => BASE_URL + `/user/me?optimistic=${optimistic}`

export const GROUPS_URL = BASE_URL + "/group/me"

export const ADD_PUNISHMENT = BASE_URL + "/group/1/user/1/punishment"

export const getAddPunishmentUrl = (groupId: string, userId: string) =>
  BASE_URL + `/group/${groupId}/user/${userId}/punishment`

export const getPostPunishmentsPaidUrl = (groupId: string) => BASE_URL + `/group/${groupId}/punishments/paid`

export const getPostPunishmentsUnpaidUrl = (groupId: string) => BASE_URL + `/group/${groupId}/punishments/unpaid`

export const getPostAllPunishmentsPaidForUserUrl = (groupId: string, userId: string) =>
  BASE_URL + `/group/${groupId}/user/${userId}/punishments/paid/all`

export const getAddReactionUrl = (punishmentId: string) => BASE_URL + `/punishment/${punishmentId}/reaction`

export const useGroupLeaderboard = (groupId?: string, cb?: (group: Group) => void) =>
  useQuery({
    queryKey: ["groupLeaderboard", groupId ?? 0],
    queryFn: () =>
      axios.get(BASE_URL + `/group/${groupId}`).then((res: AxiosResponse<Group>) => {
        const group = res.data
        // group.members = sortGroupUsers(group.members, group.punishment_types)

        if (cb) {
          cb(group)
        }

        return group
      }),
    enabled: groupId !== undefined,
  })

export const useMyGroups = () =>
  useOptimisticQuery<MeUser>(["groupsData"], (_, optimistic: boolean) =>
    axios.get(getMeUrl(optimistic)).then((res: AxiosResponse<MeUser>) => {
      const user = res.data
      user.groups = sortGroups(user.groups)
      user.groups.forEach((group) => (group.members = sortGroupUsers(group.members, group.punishment_types)))
      return user
    })
  )

export const addPunishment = (groupId: string, userId: string, punishment: PunishmentCreate) => {
  return addManyPunishments(groupId, userId, [punishment])
}

export const addManyPunishments = async (groupId: string, userId: string, punishments: PunishmentCreate[]) =>
  (await axios.post(getAddPunishmentUrl(groupId, userId), punishments)).data

export const addReaction = async (punishmentId: string, emoji: string) =>
  (await axios.post(getAddReactionUrl(punishmentId), { emoji })).data

export const removeReaction = async (punishmentId: string) => (await axios.delete(getAddReactionUrl(punishmentId))).data

const getLeaderboard = ({ pageParam = LEADERBOARD_URL }) =>
  axios.get(pageParam).then((res: AxiosResponse<Leaderboard>) => res.data)

export const useLeaderboard = () =>
  useInfiniteQuery(["leaderboard"], ({ pageParam = LEADERBOARD_URL }) => getLeaderboard(pageParam), {
    getNextPageParam: (lastPage: Leaderboard, _) => lastPage.next,
    staleTime: 1000 * 60,
  })
