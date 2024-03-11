import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"
import { FaCrown } from "react-icons/fa6"
import { GiRoundStar } from "react-icons/gi"
import { IoShield } from "react-icons/io5"
import { Group, GroupUser, Punishment, PunishmentType } from "../../helpers/types"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../accordion/Accordion"

import { IconType } from "react-icons"
import { textToEmoji } from "../../helpers/emojies"
import { PunishmentList } from "../punishment/PunishmentList"
import { useTogglePunishments } from "../../helpers/context/togglePunishmentsContext"
import { weeklyStreak } from "../../helpers/streaks"
// import { useTogglePunishments } from "../../helpers/context/togglePunishmentsContext"

interface TableItemProps {
  groupUser: GroupUser
  groupData: Group
  punishmentTypes: Record<string, PunishmentType>
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  i?: number
}

function getUnpaidPunishmentsValue(punishments: Punishment[], punishmentTypes: Record<string, PunishmentType>): number {
  return punishments.reduce((acc, punishment) => {
    return punishment.paid ? acc : acc + punishmentTypes[punishment.punishment_type_id].value * punishment.amount
  }, 0)
}

function getPunishmentTypeCounts(punishments: Punishment[]): Map<string, number> {
  return punishments.reduce((acc, punishment) => {
    if (acc.has(punishment.punishment_type_id)) {
      acc.set(punishment.punishment_type_id, acc.get(punishment.punishment_type_id)! + punishment.amount)
    } else {
      acc.set(punishment.punishment_type_id, punishment.amount)
    }
    return acc
  }, new Map<string, number>())
}

export const GroupUserTableItem = ({ groupUser, groupData, punishmentTypes, dataRefetch }: TableItemProps) => {
  const unpaidPunishmentsValue = getUnpaidPunishmentsValue(groupUser.punishments, punishmentTypes)
  const punishmentTypeCounts = getPunishmentTypeCounts(groupUser.punishments.filter((p) => !p.paid))

  const dateToNumber = groupUser.punishments
    .map((punishment) => {
      const date = punishment.created_at.slice(0, 10)
      const [year, month, day] = date.split("-").map(Number)
      return new Date(year, month - 1, day).getTime()
    })
    .sort((a, b) => a - b)
    .reverse()

  const today = new Date().getTime()
  const streak = weeklyStreak(today, dateToNumber)

  let RoleIcon: IconType | undefined
  switch (groupUser?.permissions.at(0) ?? "") {
    case "group.owner":
      RoleIcon = FaCrown
      break
    case "group.admin":
      RoleIcon = IoShield
      break
    case "group.moderator":
      RoleIcon = GiRoundStar
      break
    default:
      RoleIcon = undefined
  }

  let roleName: string | undefined
  if (RoleIcon) {
    roleName = groupData?.roles.find((role) => role.at(1) === groupUser?.permissions.at(0))?.at(0)
  }

  const { isToggled } = useTogglePunishments()

  const punishments = groupUser.punishments.filter((punishment) => !punishment.paid || isToggled)

  const displayName = groupUser.first_name && groupUser.last_name ? `${groupUser.first_name} ${groupUser.last_name}` : groupUser.email

  return (
    <AccordionItem value={groupUser.user_id}>
      <AccordionTrigger className="relative flex cursor-pointer justify-between gap-x-6 py-5 rounded-lg md:rounded-xl hover:bg-gray-50">
        <div className="flex items-center gap-x-2">
          <span className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-gray-800 text-lg md:text-3xl text-[#4C4C51] relative">
            {textToEmoji(groupUser.first_name + groupUser.last_name)}
            {RoleIcon && (
              <div className="absolute -top-2 -right-0.5">
                <RoleIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-700" title={roleName} />
              </div>
            )}
          </span>
          <div className="flex flex-col text-left">
            <p
              className="w-32 md:w-44 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs md:text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
              title={displayName}
            >
              {displayName}
            </p>
            <span className="text-gray-700 text-xs">{unpaidPunishmentsValue}kr</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col items-end">
            <p className="max-w-sm text-right hidden sm:block">
              {Object.values(groupUser.punishments)
                .filter((p) => !p.paid)
                .map((punishment) => {
                  const punishmentType = punishmentTypes[punishment.punishment_type_id]
                  return Array.from({ length: punishment.amount }, (_, i) => (
                    <span
                      key={`${punishment.punishment_id}/${i}`}
                      className="text-lg"
                      title={`${punishmentType.name} (${punishmentType.value}kr)`}
                    >
                      <span>{punishmentType.emoji}</span>
                    </span>
                  ))
                })}
            </p>
            <p className="max-w-sm text-center sm:hidden">
              {Array.from(punishmentTypeCounts)
                .map(([punishmentTypeId, amount]) => ({ punishmentType: punishmentTypes[punishmentTypeId], amount }))
                .sort((a, b) => b.punishmentType.value - a.punishmentType.value)
                .map(({ amount, punishmentType }, i) => (
                  <span
                    key={`${punishmentType.punishment_type_id}/${i}`}
                    className="whitespace-nowrap"
                    title={`${punishmentType.name} (${punishmentType.value}kr)`}
                  >
                    <span className="text-xs text-gray-800">{amount}x</span>
                    <span className="text-lg">{punishmentType.emoji}</span>
                  </span>
                ))}
            </p>
          </div>
        </div>
        {streak > 1 && (
          <div className="absolute right-12 cursor-default inline-block">
            <span
              className="text-lg"
              title={`${displayName} har fått straffer ${streak} uker på rad`}
            >
              {streak} 🔥
            </span>
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <PunishmentList
          groupUser={groupUser}
          userId={groupUser.user_id}
          groupId={groupData.group_id}
          punishmentTypes={punishmentTypes}
          dataRefetch={dataRefetch}
          isGroupContext={true}
          punishments={punishments}
        />
      </AccordionContent>
    </AccordionItem>
  )
}
