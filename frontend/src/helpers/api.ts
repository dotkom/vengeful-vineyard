import {
  type Group,
  type Leaderboard,
  type MeUser,
  type PunishmentCreate,
  type GroupStatistics,
  GroupStatisticsSchema,
  LeaderboardSchema,
  MeUserSchema,
  GroupSchema,
  PublicGroupSchema,
  type GroupBase,
  type GroupCreateType,
  type EditGroupType,
  type MutatePunishmentType,
  PunishmentsLogSchema,
  type PunishmentsLog,
} from "./types"
import {
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import axios, { type AxiosResponse } from "axios"
import { sortGroupUsers, sortGroups } from "./sorting"

import { z } from "zod"
import { useAuth } from "react-oidc-context"
import { useNotification } from "./context/notificationContext"
import { useNavigate } from "react-router-dom"
import { useMyGroupsRefetch } from "./context/myGroupsRefetchContext"
import { useCurrentUser } from "./context/currentUserContext"

export interface VengefulApiError {
  response: { data: { detail: string }; status: number; statusText: string }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

const LEADERBOARD_URL = BASE_URL + "/users/leaderboard"

const getLeaderboardUrl = (page: number, this_year: boolean) => `${LEADERBOARD_URL}?page=${page}&this_year=${this_year}`

const getPunishmentsLogUrl = (page: number) => `${BASE_URL}/punishments/log?page=${page}`

export const getLeaderboardUserPunishmentsUrl = (userId: string) => `${LEADERBOARD_URL}/punishments/${userId}`

const ME_URL = BASE_URL + "/users/me"

const getGroupUrl = (groupId: string) => BASE_URL + `/groups/${groupId}`

const GROUP_STATISTICS_URL = BASE_URL + "/statistics/groups"

const getGroupsSearchUrl = (query: string, includeOwGroups = false, limit = 5) =>
  BASE_URL + `/groups/search?query=${query}&include_ow_groups=${includeOwGroups}&limit=${limit}`
export const groupsSearchQuery = (query: string, includeOwGroups = false) => ({
  queryKey: ["groupsSearch", query],
  queryFn: () => axios.get<GroupBase[]>(getGroupsSearchUrl(query, includeOwGroups)).then((res) => res.data),
  enabled: query.length > 0,
})

const getPostGroupUrl = () => BASE_URL + "/groups"
export const postGroupMutation = (createGroupData: GroupCreateType) => {
  const { setNotification } = useNotification()
  const { myGroupsRefetch } = useMyGroupsRefetch()
  const navigate = useNavigate()

  return {
    mutationFn: async () => await axios.post(getPostGroupUrl(), createGroupData),
    onSuccess: async () => {
      if (myGroupsRefetch) {
        await myGroupsRefetch()
        navigate(`/gruppe/${createGroupData.name_short}`)
      }
      setNotification({
        type: "success",
        title: "Gruppe opprettet",
        text: "Gruppen ble opprettet",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke opprette gruppen",
        text: e.response.data.detail,
      })
    },
  }
}

const getPutGroupUrl = (groupId: string) => BASE_URL + `/groups/${groupId}`
export const putGroupMutation = (groupId: string, editGroupData: EditGroupType) => {
  const { setNotification } = useNotification()
  const { myGroupsRefetch } = useMyGroupsRefetch()
  const navigate = useNavigate()

  return {
    mutationFn: async () => await axios.patch(getPutGroupUrl(groupId), editGroupData),
    onSuccess: () => {
      myGroupsRefetch!().then(() => navigate(`/gruppe/${editGroupData.name_short}`))
      setNotification({
        type: "success",
        title: "Suksess",
        text: "Gruppen ble redigert",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke redigere gruppen",
        text: e.response.data.detail,
      })
    },
  }
}

const getDeleteGroupUrl = (groupId: string) => BASE_URL + `/groups/${groupId}`
export const deleteGroupMutation = (groupId?: string) => {
  const { setNotification } = useNotification()
  const { myGroupsRefetch } = useMyGroupsRefetch()
  const navigate = useNavigate()

  return {
    mutationFn: async () => {
      if (!groupId) throw new Error("groupId is required")
      await axios.delete(getDeleteGroupUrl(groupId))
    },
    onSuccess: async () => {
      if (myGroupsRefetch) await myGroupsRefetch()
      setNotification({
        type: "success",
        text: "Gruppen ble slettet",
      })
      navigate("/")
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke slette gruppen",
        text: e.response.data.detail,
      })
    },
  }
}

const getDeleteGroupMemberUrl = (groupId: string, userId: string) => BASE_URL + `/groups/${groupId}/users/${userId}`
export const deleteGroupMemberMutation = (groupId?: string, userId?: string) => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()
  const { currentUser } = useCurrentUser()
  const isSelf = userId === currentUser.user_id
  return {
    mutationFn: async () => {
      if (!groupId || !userId) throw new Error("groupId and userId are required")
      await axios.delete(getDeleteGroupMemberUrl(groupId, userId))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        text: isSelf ? "Du forlot gruppen" : "Medlem ble fjernet",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: isSelf ? "Kunne ikke forlate gruppen" : "Kunne ikke fjerne medlem",
        text: e.response.data.detail,
      })
    },
  }
}

const getTransferGroupOwnershipUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/transferOwnership`
export const transferGroupOwnershipMutation = (groupId: string, userId: string) => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return {
    mutationFn: async () => await axios.post(getTransferGroupOwnershipUrl(groupId, userId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        text: "Lederskap ble overført",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Lederskap kunne ikke overføres",
        text: e.response.data.detail,
      })
    },
  }
}

const getAddPunishmentUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/punishments`

const getPostPunishmentTypeUrl = (groupId: string) => `${BASE_URL}/groups/${groupId}/punishmentTypes`
export const postPunishmentTypeMutation = (groupId: string, createPunishmentTypeData: MutatePunishmentType) => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return {
    mutationFn: () => axios.post(getPostPunishmentTypeUrl(groupId), createPunishmentTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Suksess",
        text: "Straffetypen ble opprettet",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke opprette straffetypen",
        text: e.response.data.detail,
      })
    },
  }
}

const getPutPunishmentTypeUrl = (groupId: string, punishmentTypeId: string) =>
  `${BASE_URL}/groups/${groupId}/punishmentTypes/${punishmentTypeId}`
export const putPunishmentTypeMutation = (
  groupId: string,
  punishmentTypeId: string,
  editPunishmentTypeData: MutatePunishmentType
) => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return {
    mutationFn: () => axios.patch(getPutPunishmentTypeUrl(groupId, punishmentTypeId), editPunishmentTypeData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Suksess",
        text: "Straffetypen ble redigert",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke redigere straffetypen",
        text: e.response.data.detail,
      })
    },
  }
}

const getDeletePunishmentTypeUrl = (groupId: string, punishmentTypeId: string) =>
  `${BASE_URL}/groups/${groupId}/punishmentTypes/${punishmentTypeId}`
export const deletePunishmentTypeMutation = (groupId: string, punishmentTypeId: string) => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return {
    mutationFn: () => axios.delete(getDeletePunishmentTypeUrl(groupId, punishmentTypeId)).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Suksess",
        text: "Straffetypen ble slettet",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke slette straffetypen",
        text: e.response.data.detail,
      })
    },
  }
}

const getPostPunishmentsPaidUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/punishments/paid`
export const postPunishmentsPaidMutation = (groupId: string, punishmentIds: string[]) => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async () => (await axios.post(getPostPunishmentsPaidUrl(groupId), punishmentIds)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Betaling registrert",
        text: `Straff registrert betalt`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere betaling",
        text: e.response.data.detail,
      })
    },
  }
}

const getPostPunishmentsUnpaidUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/punishments/unpaid`
export const postPunishmentsUnpaidMutation = (groupId: string, punishmentId: string[]) => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async () => (await axios.post(getPostPunishmentsUnpaidUrl(groupId), punishmentId)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Betaling registrert",
        text: `Straff registrert ubetalt`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere betaling",
        text: e.response.data.detail,
      })
    },
  }
}

const getDeletePunishmentUrl = (groupId: string, punishmentId: string) =>
  BASE_URL + `/groups/${groupId}/punishments/${punishmentId}`
export const deletePunishmentMutation = (groupId: string, punishmentId: string) => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async () =>
      (
        await axios.delete(getDeletePunishmentUrl(groupId, punishmentId), {
          data: { punishment_id: punishmentId, group_id: groupId },
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Straff slettet",
        text: `Straff slettet`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke slette straff",
        text: e.response.data.detail,
      })
    },
  }
}

const getPostAllPunishmentsPaidForUserUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/punishments/paid/all`
export const postAllPunishmentsPaidForUserMutation = (groupId: string, userId: string) => {
  const queryClient = useQueryClient()
  const { setNotification } = useNotification()

  return {
    mutationFn: async () => (await axios.post(getPostAllPunishmentsPaidForUserUrl(groupId, userId))).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        show: true,
        type: "success",
        title: "Betalinger registert",
        text: `Alle straffer registrert som betalte`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere betalingene",
        text: e.response.data.detail,
      })
    },
  }
}

const getAddReactionUrl = (punishmentId: string) => BASE_URL + `/punishments/${punishmentId}/reactions`

const getPostGroupJoinRequestUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/joinRequests`
export const postGroupJoinRequestMutation = (
  groupId?: string
): UseMutationOptions<unknown, VengefulApiError, string> => {
  const { setNotification } = useNotification()

  return {
    mutationFn: async (message: string) => {
      if (!groupId) throw new Error("groupId is required")
      try {
        await axios.post(getPostGroupJoinRequestUrl(groupId), { message })

        setNotification({
          type: "success",
          text: "Forespørselen ble sendt",
        })
      } catch (e: any) {
        setNotification({
          type: "error",
          title: "Forespørselen kunne ikke sendes",
          text: e.response.data.detail,
        })
      }
    },
  }
}

const getPostAcceptGroupJoinRequestUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/joinRequests/${userId}/accept`
export const postAcceptGroupJoinRequestMutation = (groupId?: string) => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async (userId: string) => {
      if (!groupId) throw new Error("groupId is required")

      await axios.post(getPostAcceptGroupJoinRequestUrl(groupId, userId))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        text: "Brukeren ble lagt til i gruppen",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke godkjenne forespørselen",
        text: e.response.data.detail,
      })
    },
  }
}

const getPostJoinGroupUrl = (groupId: string, inviteCode: string) =>
  BASE_URL + `/groups/${groupId}/joinGroup/${inviteCode}`
export const postJoinGroupMutation = (
  groupId?: string,
  inviteCode?: string,
  groupShortName?: string
): UseMutationOptions<unknown, VengefulApiError, void> => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async () => {
      if (!groupId || !inviteCode) throw new Error("groupId and inviteCode are required")
      await axios.post(getPostJoinGroupUrl(groupId, inviteCode))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", groupId] })
      await queryClient.invalidateQueries({
        queryKey: ["leaderboard", groupId],
      })
      setNotification({
        type: "success",
        title: "Du ble lagt til i gruppen",
        text: `Du er nå medlem av gruppen ${groupShortName ?? ""}`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: `Kunne ikke legges til i gruppen ${groupShortName ?? ""}`,
        text: e.response.data.detail,
      })
    },
  }
}

const getPostDenyGroupJoinRequestUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/joinRequests/${userId}/deny`
export const postDenyGroupJoinRequestMutation = (groupId?: string) => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async (userId: string) => {
      if (!groupId) throw new Error("groupId is required")
      await axios.post(getPostDenyGroupJoinRequestUrl(groupId, userId))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["groupLeaderboard", groupId],
      })
      setNotification({
        type: "success",
        text: "Forespørselen ble avslått",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke avslå forespørselen",
        text: e.response.data.detail,
      })
    },
  }
}

const getPatchGroupMemberPermissionsUrl = (groupId: string, userId: string) =>
  BASE_URL + `/groups/${groupId}/users/${userId}/permissions`
export const patchGroupMemberPermissionsMutation = (
  groupId?: string,
  userId?: string,
  role?: string
): UseMutationOptions<unknown, VengefulApiError, void> => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()
  return {
    mutationFn: async () => {
      if (!groupId || !userId || !role) throw new Error("groupId, userId and role are required")
      try {
        await axios.patch(getPatchGroupMemberPermissionsUrl(groupId, userId), {
          privilege: role,
        })
        await queryClient.invalidateQueries({
          queryKey: ["groupLeaderboard", groupId],
        })

        setNotification({
          type: "success",
          text: "Rolle ble endret",
        })
      } catch (e: any) {
        setNotification({
          type: "error",
          title: "Rolle kunne ikke endres",
          text: e.response.data.detail,
        })
      }
    },
  }
}

const addManyPunishments = async (groupId: string, userId: string, punishments: PunishmentCreate[]) =>
  (await axios.post(getAddPunishmentUrl(groupId, userId), punishments)).data

export const addManyPunishmentsMutation = (punishments: PunishmentCreate[], groupId?: string, userId?: string) => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async () => {
      if (!groupId || !userId) throw new Error("groupId and userId are required")
      try {
        await addManyPunishments(groupId, userId, punishments)
        await queryClient.invalidateQueries({
          queryKey: ["groupLeaderboard", groupId],
        })
        await queryClient.invalidateQueries({ queryKey: ["leaderboard"] })
        await queryClient.invalidateQueries({ queryKey: ["committeesData"] })
      } catch (e: any) {
        setNotification({
          type: "error",
          title: "Kunne ikke legge til straff",
          text: e.response.data.detail,
        })
      }
    },
  }
}

const addReaction = async (punishmentId: string, emoji: string) =>
  (await axios.post(getAddReactionUrl(punishmentId), { emoji })).data
export const addReactionMutation = (punishmentId: string): UseMutationOptions<void, unknown, string> => {
  const { setNotification } = useNotification()
  return {
    mutationFn: async (emoji: string) => {
      try {
        await addReaction(punishmentId, emoji)
      } catch (e: any) {
        setNotification({
          type: "error",
          title: "Kunne ikke legge til reaction",
          text: e.response.data.detail,
        })
      }
    },
  }
}

const removeReaction = async (punishmentId: string) => (await axios.delete(getAddReactionUrl(punishmentId))).data
export const removeReactionMutation = (
  punishmentId: string,
  groupId?: string
): UseMutationOptions<void, unknown, void> => {
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()

  return {
    mutationFn: async () => {
      try {
        await removeReaction(punishmentId)
      } catch (e: any) {
        setNotification({
          type: "error",
          title: "Kunne ikke fjerne reaction",
          text: e.response.data.detail,
        })
      }
    },
    onSuccess: async () => {
      groupId
        ? await queryClient.invalidateQueries({
            queryKey: ["groupLeaderboard", groupId],
          })
        : await queryClient.invalidateQueries({
            queryKey: ["leaderboardUserPunishments"],
          })
    },
  }
}

const getPatchInviteCodeUrl = (groupId: string) => BASE_URL + `/groups/${groupId}/inviteCode`
export const patchInviteCodeMutation = (groupId: string): UseMutationOptions<void, VengefulApiError, string | null> => {
  return {
    mutationFn: async (inviteCode: string | null) => {
      await axios.patch(getPatchInviteCodeUrl(groupId), {
        invite_code: inviteCode,
      })
    },
  }
}

export const groupLeaderboardQuery = (
  groupId?: string
): UseQueryOptions<Group, unknown, Group, (string | undefined)[]> => ({
  queryKey: ["groupLeaderboard", groupId],
  queryFn: () => axios.get(getGroupUrl(z.string().parse(groupId))).then((res) => GroupSchema.parse(res.data)),
  enabled: groupId !== undefined,
  staleTime: 1000 * 60,
})

export const publicGroupQuery = (groupNameShort?: string) => ({
  queryKey: ["publicGroup", groupNameShort],
  queryFn: () =>
    axios
      .get(BASE_URL + `/groups/public_profiles/${z.string().parse(groupNameShort)}`)
      .then((res) => PublicGroupSchema.parse(res.data)),
  enabled: groupNameShort !== undefined,
  staleTime: 1000 * 60,
})

export const userQuery = (): UseQueryOptions<MeUser, unknown, MeUser> => {
  const auth = useAuth()
  return {
    queryKey: ["user"],
    queryFn: async () => {
      const user = await axios.get(ME_URL).then((res: AxiosResponse<MeUser>) => res.data)
      user.groups = sortGroups(user.groups)
      user.groups.forEach((group) => (group.members = sortGroupUsers(group.members, group.punishment_types)))
      return MeUserSchema.parse(user)
    },
    enabled: auth.isAuthenticated,
    staleTime: 1000 * 60,
    retry: 1,
  }
}

export const committeesQuery = () => ({
  queryKey: ["committeesData"],
  queryFn: () =>
    axios.get(GROUP_STATISTICS_URL).then((res: AxiosResponse<GroupStatistics[]>) => {
      return z.array(GroupStatisticsSchema).parse(Array.isArray(res.data) ? res.data : [res.data])
    }),
  staletime: 1000 * 60,
})

const getLeaderboard = async ({ pageParam = 0, this_year = true }) =>
  LeaderboardSchema.parse(await axios.get(getLeaderboardUrl(pageParam, this_year)).then((res) => res.data))

export const leaderboardQuery = (
  this_year = true
): UseInfiniteQueryOptions<Leaderboard, unknown, Leaderboard, Leaderboard, string[]> => ({
  queryKey: ["leaderboard", this_year.toString()],
  queryFn: ({ pageParam = 0 }) => getLeaderboard({ pageParam, this_year }),
  getNextPageParam: (lastPage: Leaderboard) => {
    const nextPage = lastPage.next ? new URL(lastPage.next).searchParams.get("page") : undefined
    return nextPage ? Number(nextPage) : undefined
  },
  staleTime: 1000 * 60,
})

const getPunishmentsLog = async ({ pageParam = 0 }) =>
  PunishmentsLogSchema.parse(await axios.get(getPunishmentsLogUrl(pageParam)).then((res) => res.data))

export const punishmentsQuery = (): UseInfiniteQueryOptions<
  PunishmentsLog,
  unknown,
  PunishmentsLog,
  PunishmentsLog,
  string[]
> => ({
  queryKey: ["punishmentsLog"],
  queryFn: getPunishmentsLog,
  getNextPageParam: (lastPage: PunishmentsLog) => {
    const nextPage = lastPage.next ? new URL(lastPage.next).searchParams.get("page") : undefined
    return nextPage ? Number(nextPage) : undefined
  },
  staleTime: 1000 * 60,
})
