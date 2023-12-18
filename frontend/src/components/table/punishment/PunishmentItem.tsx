import { GroupUser, LeaderboardPunishment, LeaderboardUser, Punishment, PunishmentType } from "../../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from "@tanstack/react-query"
import {
  addReaction,
  getPostPunishmentsPaidUrl,
  getPostPunishmentsUnpaidUrl,
  removeReaction,
} from "../../../helpers/api"
import axios, { AxiosResponse } from "axios"
import { useContext, useState } from "react"

import { BorderedButton } from "../../button"
import { EmojiPicker } from "./emojies/EmojiPicker"
import { NotificationContext } from "../../../helpers/notificationContext"
import { ReactionsDisplay } from "./emojies/ReactionDisplay"
import dayjs from "dayjs"

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
  punishment,
  punishmentTypes,
  isGroupContext = false,
  dataRefetch,
}: PunishmentItemProps) => {
  const [_selectedEmoji, setSelectedEmoji] = useState("👍")
  const { setNotification } = useContext(NotificationContext)

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
    onError: () =>
      setNotification({
        show: true,
        type: "error",
        title: "Noe gikk galt",
        text: "Kunne ikke legge til reaction",
      }),
  })

  const { mutate: mutateRemoveReaction } = useMutation(removeReactionCall, {
    onSuccess: () => dataRefetch(),
    onError: () =>
      setNotification({
        show: true,
        type: "error",
        title: "Noe gikk galt",
        text: "Kunne ikke fjerne reaction",
      }),
  })

  const { mutate: markPunishmentAsPaid } = useMutation(markPunishmentAsPaidCall, {
    onSuccess: () => {
      dataRefetch()
      setNotification({
        show: true,
        type: "success",
        title: "Betaling registrert",
        text: `Straff registrert betalt`,
      })
    },
    onError: () => {
      setNotification({
        show: true,
        type: "error",
        title: "Noe gikk galt",
        text: "Kunne ikke registrere betaling",
      })
    },
  })

  const { mutate: markPunishmentAsUnpaid } = useMutation(markPunishmentAsUnpaidCall, {
    onSuccess: () => {
      dataRefetch()
      setNotification({
        show: true,
        type: "success",
        title: "Betaling registrert",
        text: `Straff registrert ubetalt`,
      })
    },
    onError: () => {
      setNotification({
        show: true,
        type: "error",
        title: "Noe gikk galt",
        text: "Kunne ikke registrere betaling",
      })
    },
  })

  const date = dayjs(punishment.created_at)
  const formattedDate = date.format("DD. MMM YY")

  const isWallOfShame = /wall-of-shame/.test(window.location.href)

  if (punishmentType === undefined) {
    return <p>Punishment type not found</p>
  }

  return (
    <div
      className={`flex flex-col justify-between border-b border-l-8 md:border-l-4 px-4 pt-4 pb-4 min-h-[7rem] ${
        !punishment.paid ? "border-l-indigo-600" : "border-l-slate-400"
      }`}
    >
      <div className="flex flex-row justify-between">
        <div className="text-left font-light">
          <p>
            <span className="block">
              {punishment.reason_hidden && isWallOfShame ? (
                <span className="italic">*Årsak skjult*</span>
              ) : (
                punishment.reason
              )}
            </span>
            <span className="block text-gray-500">- Gitt av {punishment.created_by_name}</span>
          </p>
        </div>
        <div className="max-w-xs">
          {Array.from({ length: punishment.amount }, (_, i) => (
            <span
              key={`${punishment.punishment_id}/${i}`}
              className="text-xl"
              title={`${punishmentType?.name} (${punishmentType?.value}kr)`}
            >
              {punishmentType?.logo_url}
            </span>
          ))}
        </div>
        <div className="text-gray-500 font-normal flex-end ml-auto">{formattedDate}</div>
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
        <div className="flex flex-row gap-x-4 ml-auto items-center text-slate-500">
          {/* {isGroupContext && paidAmount && (
            <span>{paidAmount}/{punishmentType.value}kr</span>
          )} */}
          {isGroupContext && !punishment.paid && (
            <BorderedButton
              label="Marker som betalt"
              onClick={() => {
                markPunishmentAsPaid()
              }}
            />
          )}

          {isGroupContext && punishment.paid && (
            <BorderedButton
              label="Marker som ubetalt"
              onClick={() => {
                markPunishmentAsUnpaid()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
