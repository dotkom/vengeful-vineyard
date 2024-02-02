import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"
import { FaCrown } from "react-icons/fa6"
import { GiRoundStar } from "react-icons/gi"
import { IoShield } from "react-icons/io5"
import {
  Group,
  GroupUser,
  LeaderboardPunishment,
  LeaderboardUser,
  Punishment,
  PunishmentType,
} from "../../helpers/types"
import { AccordionContent, AccordionItem, AccordionTrigger } from "./accordion/Accordion"

import { IconType } from "react-icons"
import { textToEmoji, userEmoji } from "../../helpers/emojies"
import { PunishmentList } from "./punishment/PunishmentList"

interface TableItemProps {
  groupUser?: GroupUser | undefined
  groupData?: Group | undefined
  leaderboardUser?: LeaderboardUser | undefined
  punishmentTypes: PunishmentType[]
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  i?: number
}

export const TableItem = ({
  groupUser,
  groupData,
  leaderboardUser,
  punishmentTypes = [],
  dataRefetch,
  i,
}: TableItemProps) => {
  const user = groupUser ?? leaderboardUser
  if (user === undefined) {
    return <p>user is undefined</p>
  }

  const isGroupContext = groupUser !== undefined

  const totalPunishments: { punishment: Punishment; punishmentType: PunishmentType }[] = []
  const punishmentTypeMap = new Map<string, PunishmentType>()

  punishmentTypes.forEach((type) => {
    punishmentTypeMap.set(type.punishment_type_id, type)
  })

  let unpaidPunishmentsValue = 0
  const unpaidPunishments: Punishment[] = []
  const paidPunishments: Punishment[] = []

  for (let i = user.punishments.length - 1; i >= 0; i--) {
    const punishment = user.punishments[i]

    if (isGroupContext && !punishmentTypes.some((type) => type.punishment_type_id === punishment.punishment_type_id)) {
      continue
    }

    if (punishment.paid) {
      paidPunishments.push(punishment)
    } else {
      unpaidPunishments.push(punishment)
    }

    let fixedPunishmentType: PunishmentType

    if (isGroupContext) {
      const punishmentType = punishmentTypeMap.get(punishment.punishment_type_id)

      fixedPunishmentType = {
        punishment_type_id: punishmentType?.punishment_type_id ?? "N/A",
        name: punishmentType?.name ?? "N/A",
        value: punishmentType?.value ?? 0,
        emoji: punishmentType?.emoji ?? "?",
      }
    } else {
      const innerPunishment = punishment as LeaderboardPunishment

      fixedPunishmentType = {
        punishment_type_id: innerPunishment.punishment_type.punishment_type_id,
        name: innerPunishment.punishment_type.name,
        value: innerPunishment.punishment_type.value,
        emoji: innerPunishment.punishment_type.emoji,
      }
    }

    if (!punishment.paid) {
      totalPunishments.push({ punishment, punishmentType: fixedPunishmentType })
      unpaidPunishmentsValue += fixedPunishmentType.value * punishment.amount
    }
  }

  function weeklyStreak(date: number, listDates: number[]) {
    let streak = [date]
    for (let i = 1; i <= listDates.length; i++) {
      for (let j = 0; j < listDates.length; j++) {
        const compareDate = streak[i - 1]
        const prewDate = listDates[0]
        if (compareDate <= 604800000 + prewDate && prewDate <= compareDate) {
          streak[i] = prewDate
          listDates.shift()
        } else {
          if (prewDate! <= compareDate) {
            break
          }
        }
      }
      if (streak[i] === undefined) {
        break
      }
    }
    return streak.length - 1
  }

  // Punishment dates to number from most recent to oldest
  const dateToNumber = user.punishments
    .map((punishment) => {
      const date = punishment.created_at.slice(0, 10)
      const [year, month, day] = date.split("-").map(Number)
      return new Date(year, month - 1, day).getTime()
    })
    .reverse()

  const today = new Date().getTime()
  const streak = weeklyStreak(today, dateToNumber)

  let RoleIcon: IconType | undefined
  if (isGroupContext) {
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
  }

  let roleName: string | undefined
  if (RoleIcon) {
    roleName = groupData?.roles.find((role) => role.at(1) === groupUser?.permissions.at(0))?.at(0)
  }

  const getPunishmentTypeAmounts = () =>
    totalPunishments.reduce((acc, { punishment, punishmentType }) => {
      const punishmentTypeId = punishmentType.punishment_type_id
      if (acc.has(punishmentTypeId)) {
        acc.set(punishmentTypeId, {
          amount: (acc.get(punishmentTypeId)?.amount ?? 0) + punishment.amount,
          punishmentType,
        })
      } else {
        acc.set(punishmentTypeId, { amount: punishment.amount, punishmentType })
      }

      return acc
    }, new Map<string, { punishmentType: PunishmentType; amount: number }>())

  return (
    <AccordionItem value={user.user_id.toString()}>
      <AccordionTrigger className="relative flex cursor-pointer justify-between gap-x-6 py-5 rounded-lg md:rounded-xl hover:bg-gray-50">
        <div className="flex items-center gap-x-2">
          <span className="flex h-8 w-8 md:h-12 md:w-12 pt-1 items-center justify-center rounded-full bg-indigo-100 dark:bg-gray-800 text-lg md:text-3xl text-[#4C4C51] relative">
            {/* Displays the ith placement on the leaderboard if i is defined, otherwise displays an emoji */}
            {i !== undefined ? (i + 1 === 1 ? "🥇" : i + 1 === 2 ? "🥈" : i + 1 === 3 ? "🥉" : i + 1) : userEmoji(user)}
            {RoleIcon && (
              <div className="absolute -top-2 -right-0.5">
                <RoleIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-700" title={roleName} />
              </div>
            )}
          </span>
          <div className="flex flex-col text-left">
            <p
              className="w-32 md:w-44 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs md:text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
              title={`${user.first_name} ${user.last_name}`}
            >
              {user.first_name} {user.last_name}
            </p>
            <span className="text-gray-700 text-xs">{unpaidPunishmentsValue}kr</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col items-end">
            <p className="max-w-sm text-right hidden sm:block">
              {totalPunishments.map(({ punishment, punishmentType }) =>
                Array.from({ length: punishment.amount }, (_, i) => (
                  <span
                    key={`${punishment.punishment_id}/${i}`}
                    className="text-lg"
                    title={`${punishmentType.name} (${punishmentType.value}kr)`}
                  >
                    <span>{punishmentType.emoji}</span>
                  </span>
                ))
              )}
            </p>
            <p className="max-w-sm text-center sm:hidden">
              {Array.from(getPunishmentTypeAmounts())
                .sort(([_, { punishmentType: a }], [__, { punishmentType: b }]) => b.value - a.value)
                .map(([_, { amount, punishmentType }]) => (
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
        {streak > 2 && (
          <div className="absolute right-12 cursor-default inline-block">
            <span
              className="text-lg"
              title={`${user.first_name} ${user.last_name} har fått straffer ${streak} uker på rad`}
            >
              {streak} 🔥
            </span>
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <PunishmentList
          groupUser={groupUser}
          leaderboardUser={leaderboardUser}
          unpaidPunishments={unpaidPunishments}
          paidPunishments={paidPunishments}
          punishmentTypes={punishmentTypes}
          dataRefetch={dataRefetch}
        />
      </AccordionContent>
    </AccordionItem>
  )
}
