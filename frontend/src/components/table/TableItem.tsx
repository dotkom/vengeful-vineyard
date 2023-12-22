import { AccordionContent, AccordionItem, AccordionTrigger } from "./accordion/Accordion"
import { GroupUser, LeaderboardPunishment, LeaderboardUser, Punishment, PunishmentType } from "../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { PunishmentList } from "./punishment/PunishmentList"
import { ReactNode } from "react"
import { textToEmoji } from "../../helpers/emojies"

interface TableItemProps {
  groupUser?: GroupUser | undefined
  leaderboardUser?: LeaderboardUser | undefined
  punishmentTypes: PunishmentType[]
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  i?: number
}

export const TableItem = ({ groupUser, leaderboardUser, punishmentTypes = [], dataRefetch, i }: TableItemProps) => {
  const user = groupUser ?? leaderboardUser
  if (user === undefined) {
    return <p>user is undefined</p>
  }

  const isGroupContext = groupUser !== undefined

  const totalPunishment: ReactNode[] = []
  const punishmentTypeMap = new Map<string, PunishmentType>()

  punishmentTypes.forEach((type) => {
    punishmentTypeMap.set(type.punishment_type_id, type)
  })

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

    let name: string
    let value: number
    let logoUrl: string

    if (isGroupContext) {
      const punishmentType = punishmentTypeMap.get(punishment.punishment_type_id)

      name = punishmentType?.name ?? "N/A"
      value = punishmentType?.value ?? 0
      logoUrl = punishmentType?.logo_url ?? "?"
    } else {
      const innerPunishment = punishment as LeaderboardPunishment
      name = innerPunishment.punishment_type.name
      value = innerPunishment.punishment_type.value
      logoUrl = innerPunishment.punishment_type.logo_url
    }

    if (!punishment.paid) {
      for (let j = 0; j < punishment.amount; j++) {
        totalPunishment.push(
          <span key={`${punishment.punishment_id}/${i}/${j}`} className="text-lg" title={`${name} (${value}kr)`}>
            <span>{logoUrl}</span>
          </span>
        )
      }
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

  return (
    <AccordionItem value={user.user_id.toString()}>
      <AccordionTrigger className="relative flex cursor-pointer justify-between gap-x-6 py-5 hover:bg-gray-50">
        <div className="flex items-center gap-x-2">
          <span className="flex h-8 w-8 md:h-12 md:w-12 pt-1 items-center justify-center rounded-full bg-indigo-100 text-lg md:text-3xl text-[#4C4C51]">
            {/* Displays the ith placement on the leaderboard if i is defined, otherwise displays an emoji */}
            {i !== undefined
              ? i + 1 === 1
                ? "🥇"
                : i + 1 === 2
                ? "🥈"
                : i + 1 === 3
                ? "🥉"
                : i + 1
              : textToEmoji(user.first_name + user.last_name)}
          </span>
          <p
            className="w-48 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs md:text-sm font-semibold leading-6 text-gray-900"
            title={`${user.first_name} ${user.last_name}`}
          >
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="hidden sm:flex sm:flex-col sm:items-end">
            <p className="max-w-sm text-right">{totalPunishment.map((punishment) => punishment)}</p>
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
      <AccordionContent className="overflow-visible">
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
