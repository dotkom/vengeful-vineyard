import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from "@tanstack/react-query"
import axios, { AxiosResponse } from "axios"
import {
  VengefulApiError,
  addReaction,
  getPostPunishmentsPaidUrl,
  getPostPunishmentsUnpaidUrl,
  removeReaction,
  useGroupLeaderboard,
} from "../../../helpers/api"
import { GroupUser, LeaderboardPunishment, LeaderboardUser, Punishment, PunishmentType } from "../../../helpers/types"

import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { useState } from "react"
import { classNames } from "../../../helpers/classNames"
import { useNotification } from "../../../helpers/context/notificationContext"
import { hasPermission } from "../../../helpers/permissions"
import { Button } from "../../button"
import { EmojiPicker } from "./emojies/EmojiPicker"
import { ReactionsDisplay } from "./emojies/ReactionDisplay"

dayjs.extend(utc)
dayjs.extend(timezone)

interface PunishmentItemProps {
  user: LeaderboardUser | GroupUser
  punishment: Punishment | LeaderboardPunishment
  punishmentTypes: PunishmentType[]
  isGroupContext?: boolean
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any>>
}

export const PunishmentItem = ({
  user,
  punishment,
  punishmentTypes,
  isGroupContext = false,
  dataRefetch,
}: PunishmentItemProps) => {
  const [_selectedEmoji, setSelectedEmoji] = useState("👍")
  const { setNotification } = useNotification()

  const { data: groupData } = useGroupLeaderboard((user as GroupUser).group_id, undefined, {
    enabled: isGroupContext,
  })

  const groupPermissions = groupData?.permissions ?? {}
  const currentGroupUser = groupData?.members.find((groupUser) => groupUser.user_id === user.user_id)
  const currentGroupUserRole = currentGroupUser?.permissions.at(0) ?? ""

  let punishmentType = punishmentTypes.find((type) => type.punishment_type_id === punishment.punishment_type_id)

  if (!punishmentType) {
    const innerPunishment = punishment as LeaderboardPunishment
    punishmentType = innerPunishment.punishment_type
  }

  const addReactionCall = async (emoji: string) => addReaction(punishment.punishment_id, emoji)
  const removeReactionCall = async () => removeReaction(punishment.punishment_id)

  const markPunishmentAsPaidCall = async () => {
    if (!punishmentType) {
      throw new Error("Punishment type is undefined")
    }

    if (punishment.group_id === null) {
      // this should never happen
      return
    }

    const POST_PUNISHMENTS_PAID_URL = getPostPunishmentsPaidUrl(punishment.group_id)
    const res: AxiosResponse<string> = await axios.post(POST_PUNISHMENTS_PAID_URL, [punishment.punishment_id])

    return res.data
  }

  const markPunishmentAsUnpaidCall = async () => {
    if (!punishmentType) {
      throw new Error("Punishment type is undefined")
    }

    if (punishment.group_id === null) {
      // this should never happen
      return
    }

    const POST_PUNISHMENTS_PAID_URL = getPostPunishmentsUnpaidUrl(punishment.group_id)
    const res: AxiosResponse<string> = await axios.post(POST_PUNISHMENTS_PAID_URL, [punishment.punishment_id])

    return res.data
  }

  const { mutate: mutateAddReaction } = useMutation(addReactionCall, {
    onSuccess: () => dataRefetch(),
    onError: (e: VengefulApiError) =>
      setNotification({
        type: "error",
        title: "Kunne ikke legge til reaction",
        text: e.response.data.detail,
      }),
  })

  const { mutate: mutateRemoveReaction } = useMutation(removeReactionCall, {
    onSuccess: () => dataRefetch(),
    onError: (e: VengefulApiError) =>
      setNotification({
        type: "error",
        title: "Kunne ikke fjerne reaction",
        text: e.response.data.detail,
      }),
  })

  const { mutate: markPunishmentAsPaid } = useMutation(markPunishmentAsPaidCall, {
    onSuccess: () => {
      dataRefetch()
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
  })

  const { mutate: markPunishmentAsUnpaid } = useMutation(markPunishmentAsUnpaidCall, {
    onSuccess: () => {
      dataRefetch()
      setNotification({
        type: "success",
        title: "Betaling registrert",
        text: `Straff registrert ubetalt`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere som ubetalt",
        text: e.response.data.detail,
      })
    },
  })

  const date = dayjs.utc(punishment.created_at).tz("Europe/Oslo")

  const formattedDate = date.format("DD. MMM HH:mm")
  const formattedLongerDate = date.format("DD. MMM YYYY HH:mm")

  const isWallOfShame = !isGroupContext

  if (punishmentType === undefined) {
    return <p>Punishment type not found</p>
  }

  return (
    <div
      className={classNames(
        "flex flex-col justify-between border-l-4 md:border-l-[6px] px-4 pt-4 pb-4 min-h-[7rem] bg-white",
        !punishment.paid ? "border-l-indigo-600" : "border-l-indigo-400"
      )}
    >
      <div className="flex flex-row justify-between gap-x-2 text-black">
        <div className="text-left font-light">
          <p>
            <span className="block text-sm md:text-base">
              {punishment.reason_hidden && isWallOfShame ? (
                <span className="italic">*Årsak skjult*</span>
              ) : punishment.reason ? (
                punishment.reason
              ) : (
                <span className="italic">Ingen årsak</span>
              )}
            </span>
            <span className="block text-gray-500 text-sm whitespace-nowrap md:text-base w-40 md:w-48 overflow-hidden text-ellipsis">
              - Gitt av {punishment.created_by_name}
            </span>
          </p>
        </div>
        <div className="max-w-xs text-center">
          {Array.from({ length: punishment.amount }, (_, i) => (
            <span
              key={`${punishment.punishment_id}/${i}`}
              className="md:text-xl"
              title={`${punishmentType?.name} (${punishmentType?.value}kr)`}
            >
              {punishmentType?.emoji}
            </span>
          ))}
        </div>
        <div
          className="text-gray-500 font-normal flex-end ml-auto whitespace-nowrap text-sm md:text-base"
          title={formattedLongerDate}
        >
          {formattedDate}
        </div>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-row gap-x-2 items-end">
          <EmojiPicker mutate={mutateAddReaction} setSelectedEmoji={setSelectedEmoji} />
          <ReactionsDisplay
            mutate={mutateAddReaction}
            removeMutation={mutateRemoveReaction}
            setSelectedEmoji={setSelectedEmoji}
            reactions={punishment.reactions}
          />
        </div>
        {isGroupContext && (
          <div className="flex flex-row gap-x-4 ml-auto items-center text-slate-500">
            {punishment.paid &&
              hasPermission(groupPermissions, "group.punishments.mark_unpaid", currentGroupUserRole) && (
                <Button
                  variant="OUTLINE"
                  label="Marker som ubetalt"
                  onClick={() => {
                    markPunishmentAsUnpaid()
                  }}
                />
              )}

            {!punishment.paid &&
              hasPermission(groupPermissions, "group.punishments.mark_paid", currentGroupUserRole) && (
                <Button
                  variant="OUTLINE"
                  label="Marker som betalt"
                  onClick={() => {
                    markPunishmentAsPaid()
                  }}
                />
              )}
          </div>
        )}
      </div>
    </div>
  )
}
