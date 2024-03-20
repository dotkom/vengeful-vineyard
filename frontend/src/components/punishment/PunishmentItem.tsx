import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation, useQuery } from "@tanstack/react-query"
import {
  groupLeaderboardQuery,
  addReactionMutation,
  removeReactionMutation,
  deletePunishmentMutation,
  postPunishmentsUnpaidMutation,
  postPunishmentsPaidMutation,
} from "../../helpers/api"
import { LeaderboardPunishment, Punishment, PunishmentType } from "../../helpers/types"

import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { useState } from "react"
import { classNames } from "../../helpers/classNames"
import { Button } from "../button"
import { EmojiPicker } from "./emojies/EmojiPicker"
import { ReactionsDisplay } from "./emojies/ReactionDisplay"
import { useConfirmModal } from "../../helpers/context/modal/confirmModalContext"
import { usePermission } from "../../helpers/permissions"
import Tooltip from "../tooltip/Tooltip"

dayjs.extend(utc)
dayjs.extend(timezone)

interface PunishmentItemProps {
  group_id?: string
  user_id: string
  punishment: Punishment | LeaderboardPunishment
  punishmentTypes?: Record<string, PunishmentType>
  isGroupContext?: boolean
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any>>
}

export const PunishmentItem = ({
  group_id,
  punishment,
  punishmentTypes,
  isGroupContext = false,
  dataRefetch,
}: PunishmentItemProps) => {
  const [_selectedEmoji, setSelectedEmoji] = useState("👍")

  const { data: groupData } = useQuery(groupLeaderboardQuery(group_id))

  let punishmentType = punishmentTypes ? punishmentTypes[punishment.punishment_type_id] : undefined

  if (!punishmentType) {
    const innerPunishment = punishment as LeaderboardPunishment
    punishmentType = innerPunishment.punishment_type
  }

  const { mutate: mutateAddReaction } = useMutation({
    ...addReactionMutation(punishment.punishment_id),
    onSuccess: () => dataRefetch(),
  })

  const { mutate: removeReaction } = useMutation(removeReactionMutation(punishment.punishment_id))

  const { mutate: markPunishmentAsPaid } = useMutation(
    postPunishmentsPaidMutation(punishment.group_id!, [punishment.punishment_id])
  )

  const { mutate: markPunishmentAsUnpaid } = useMutation(
    postPunishmentsUnpaidMutation(punishment.group_id!, [punishment.punishment_id])
  )

  const { mutate: deletePunishment } = useMutation(
    deletePunishmentMutation(punishment.group_id!, punishment.punishment_id)
  )

  const canMarkAsPaid = usePermission("group.punishments.mark_paid", groupData)
  const canMarkAsUnpaid = usePermission("group.punishments.mark_unpaid", groupData)
  const canDelete = usePermission("group.punishments.delete", groupData)

  const date = dayjs.utc(punishment.created_at).tz("Europe/Oslo")

  const formattedDate = date.format("DD. MMM HH:mm")
  const formattedLongerDate = date.format("DD. MMM YYYY HH:mm")

  const isWallOfShame = !isGroupContext

  if (punishmentType === undefined) {
    return <p>Punishment type not found</p>
  }

  const {
    setOpen: setConfirmModalOpen,
    setType: setConfirmModalType,
    setOptions: setConfirmModalOptions,
  } = useConfirmModal()

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
            removeMutation={removeReaction}
            setSelectedEmoji={setSelectedEmoji}
            reactions={punishment.reactions}
          />
        </div>
        {isGroupContext && (
          <div className="flex flex-row gap-x-4 ml-auto items-center text-slate-500">
            {punishment.paid && canMarkAsPaid && (
              <Button
                variant="OUTLINE"
                label="Marker som ubetalt"
                onClick={() => {
                  markPunishmentAsUnpaid()
                }}
              />
            )}

            {!punishment.paid && canMarkAsUnpaid && (
              <Button
                variant="OUTLINE"
                label="Marker som betalt"
                onClick={() => {
                  markPunishmentAsPaid()
                }}
              />
            )}

            {canDelete && (
              <Button
                variant="OUTLINE"
                color="RED"
                label="Slett straff"
                onClick={() => {
                  setConfirmModalType("YESNO")
                  setConfirmModalOptions({
                    onClose: (retVal) => {
                      if (retVal) deletePunishment()
                    },
                    primaryButtonLabel: "Slett",
                    cancelButtonLabel: "Avbryt",
                  })
                  setConfirmModalOpen(true)
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
