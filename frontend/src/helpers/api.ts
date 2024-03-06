import {
  Group,
  Leaderboard,
  MeUser,
  PunishmentCreate,
  GroupStatistics,
  GroupStatisticsSchema,
  LeaderboardSchema,
  MeUserSchema,
  GroupSchema,
  PublicGroupSchema,
  PublicGroup,
} from "./types"
import { QueryKey, UseInfiniteQueryOptions, UseQueryOptions, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import axios, { AxiosResponse } from "axios"
import { sortGroupUsers, sortGroups } from "./sorting"

import { useOptimisticQuery } from "./optimisticQuery"
import { z } from "zod"

export interface VengefulApiError {
  response: { data: { detail: string }; status: number; statusText: string }
}

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export const LEADERBOARD_URL = BASE_URL + "/users/leaderboard"

export const getLeaderboardUrl = (page: number) => `${LEADERBOARD_URL}?page=${page}`

export const getMeUrl = (optimistic: boolean) => BASE_URL + `/users/me?optimistic=${optimistic}`

export const GROUPS_URL = BASE_URL + "/groups/me"

export const getGroupUrl = (groupId: string) => BASE_URL + `/groups/${groupId}`

export const getGroupStatisticsUrl = () => BASE_URL + "/statistics/groups"

export const getGroupsSearchUrl = (query: string, includeOwGroups: boolean = false, limit: number = 5) =>
  BASE_URL + `/groups/search?query=${query}&include_ow_groups=${includeOwGroups}&limit=${limit}`

export const getPostGroupUrl = () => BASE_URL + "/groups"

export const getPutGroupUrl = (groupId: string) => BASE_URL + `/groups/${groupId}`

export const getDeleteGroupUrl = (groupId: string) => BASE_URL + `/groups/${groupId}`

export const getDeleteGroupMemberUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}`

export const getTransferGroupOwnershipUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/transferOwnership`

export const getAddPunishmentUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/punishments`

export const getPostPunishmentTypeUrl = (groupId: string) => `${BASE_URL}/groups/${groupId}/punishmentTypes`

export const getPutPunishmentTypeUrl = (groupId: string, punishmentTypeId: string) =>
  `${BASE_URL}/groups/${groupId}/punishmentTypes/${punishmentTypeId}`

export const getDeletePunishmentTypeUrl = (groupId: string, punishmentTypeId: string) =>
  `${BASE_URL}/groups/${groupId}/punishmentTypes/${punishmentTypeId}`

export const getPostPunishmentsPaidUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/punishments/paid`

export const getPostPunishmentsUnpaidUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/punishments/unpaid`

export const getDeletePunishmentUrl = (groupId: string, punishmentId: string) =>
  BASE_URL + `/groups/${groupId}/punishments/${punishmentId}`

export const getPostAllPunishmentsPaidForUserUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/punishments/paid/all`

export const getAddReactionUrl = (punishmentId: string) => BASE_URL + `/punishments/${punishmentId}/reactions`

export const getPostGroupJoinRequestUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/joinRequests`

export const getPostAcceptGroupJoinRequestUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/joinRequests/${userId}/accept`

export const getPostDenyGroupJoinRequestUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/joinRequests/${userId}/deny`

export const getPatchGroupMemberPermissionsUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/permissions`

export const useGroupLeaderboard = (
  groupId?: string,
  cb?: (group: Group) => void,
  options?: Omit<UseQueryOptions<Group, unknown, Group, (string | undefined)[]>, "initialData"> & {
    initialData?: (() => undefined) | undefined
  }
) =>
  useQuery({
    queryKey: ["groupLeaderboard", groupId],
    queryFn: () =>
      axios.get(getGroupUrl(groupId ?? "")).then(async (res: AxiosResponse<Group>) => GroupSchema.parse(res.data)),
    onSuccess: (group: Group) => {
      if (cb) {
        cb(group)
      }
    },
    enabled: groupId !== undefined,
    ...options,
  })

export const usePublicGroup = (
  groupNameShort?: string,
  options?: UseQueryOptions<PublicGroup, unknown, PublicGroup, [string, string]>
) =>
  useQuery(
    ["publicGroup", groupNameShort === undefined ? "" : groupNameShort],
    async () => {
      const response = await axios.get(BASE_URL + `/groups/public_profiles/${groupNameShort}`)

      return PublicGroupSchema.parse(response.data)
    },
    options
  )

export const useMyGroups = (options?: UseQueryOptions<MeUser, unknown, MeUser, [QueryKey, boolean]>) =>
  useOptimisticQuery<MeUser>(
    ["groupsData"],
    (_, optimistic: boolean) =>
      axios.get(getMeUrl(optimistic)).then((res: AxiosResponse<MeUser>) => {
        const user = res.data
        user.groups = sortGroups(user.groups)
        user.groups.forEach((group) => (group.members = sortGroupUsers(group.members, group.punishment_types)))
        return MeUserSchema.parse(user)
      }),
    options
  )

export const useCommittees = (
  options?: UseQueryOptions<GroupStatistics[], unknown, GroupStatistics[], [QueryKey, boolean]>
) =>
  useOptimisticQuery<GroupStatistics[]>(
    ["committeesData"],
    () =>
      axios.get(getGroupStatisticsUrl()).then((res: AxiosResponse<GroupStatistics[]>) => {
        return z.array(GroupStatisticsSchema).parse(Array.isArray(res.data) ? res.data : [res.data])
      }),
    options
  )

export const addPunishment = (groupId: string, userId: string, punishment: PunishmentCreate) => {
  return addManyPunishments(groupId, userId, [punishment])
}

export const addManyPunishments = async (groupId: string, userId: string, punishments: PunishmentCreate[]) =>
  (await axios.post(getAddPunishmentUrl(groupId, userId), punishments)).data

export const addReaction = async (punishmentId: string, emoji: string) =>
  (await axios.post(getAddReactionUrl(punishmentId), { emoji })).data

export const removeReaction = async (punishmentId: string) => (await axios.delete(getAddReactionUrl(punishmentId))).data

const getLeaderboard = async ({ pageParam = 0 }) =>
  LeaderboardSchema.parse(await axios.get(getLeaderboardUrl(pageParam)).then((res) => res.data))

export const useLeaderboard = (
  options?: Omit<
    UseInfiniteQueryOptions<Leaderboard, unknown, Leaderboard, Leaderboard, string[]>,
    "queryFn" | "queryKey"
  >
) =>
  useInfiniteQuery(["leaderboard"], getLeaderboard, {
    getNextPageParam: (lastPage) => {
      // Assuming you can determine the next page number from the last page data
      const nextPage = lastPage.next ? new URL(lastPage.next).searchParams.get("page") : undefined
      return nextPage ? Number(nextPage) : undefined
    },
    ...options,
  })
