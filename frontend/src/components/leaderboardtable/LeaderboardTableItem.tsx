import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"
import { LeaderboardPunishment, LeaderboardUser } from "../../helpers/types"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../accordion/Accordion"

import { textToEmoji } from "../../helpers/emojies"
import { PunishmentList } from "../punishment/PunishmentList"
import { weeklyStreak } from "../../helpers/streaks"

interface TableItemProps {
  leaderboardUser: LeaderboardUser
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  i?: number
}

export const LeaderboardTableItem = ({ leaderboardUser, dataRefetch, i }: TableItemProps) => {
  const punishmentTypes = leaderboardUser.punishments.reduce((acc, punishment) => {
    const oldValue = acc.get(punishment.punishment_type_id)
    if (oldValue) {
      acc.set(punishment.punishment_type_id, {
        amount: oldValue.amount + punishment.amount,
        punishment: punishment,
      })
    } else {
      acc.set(punishment.punishment_type_id, { amount: punishment.amount, punishment: punishment })
    }
    return acc
  }, new Map<string, { amount: number; punishment: LeaderboardPunishment }>())

  const totalPunishmentValue = leaderboardUser.punishments.reduce(
    (acc, punishment) => acc + punishment.punishment_type.value * punishment.amount,
    0
  )

  // Punishment dates to number from most recent to oldest
  const dateToNumber = leaderboardUser?.punishments
    .map((punishment) => {
      const date = punishment.created_at.slice(0, 10)
      const [year, month, day] = date.split("-").map(Number)
      return new Date(year, month - 1, day).getTime()
    })
    .reverse()

  const today = new Date().getTime()
  const streak = weeklyStreak(today, dateToNumber)

  return (
    <AccordionItem value={leaderboardUser.user_id}>
      <AccordionTrigger className="relative flex cursor-pointer justify-between gap-x-6 py-5 rounded-lg md:rounded-xl hover:bg-gray-50">
        <div className="flex items-center gap-x-2">
          <span className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-gray-800 text-lg md:text-3xl text-[#4C4C51] relative">
            {i !== undefined
              ? i + 1 === 1
                ? "🥇"
                : i + 1 === 2
                ? "🥈"
                : i + 1 === 3
                ? "🥉"
                : i + 1
              : textToEmoji(leaderboardUser.first_name + leaderboardUser.last_name)}
          </span>
          <div className="flex flex-col text-left">
            <p
              className="w-32 md:w-44 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs md:text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
              title={`${leaderboardUser.first_name} ${leaderboardUser.last_name}`}
            >
              {leaderboardUser.first_name} {leaderboardUser.last_name}
            </p>
            <span className="text-gray-700 text-xs">{totalPunishmentValue}kr</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col items-end">
            <p className="max-w-sm text-right hidden sm:block">
              {leaderboardUser.punishments.map((punishment) =>
                Array.from({ length: punishment.amount }, (_, i) => (
                  <span
                    key={`${punishment.punishment_id}/${i}`}
                    className="text-lg"
                    title={`${punishment.punishment_type.name} (${punishment.punishment_type.value}kr)`}
                  >
                    <span>{punishment.punishment_type.emoji}</span>
                  </span>
                ))
              )}
            </p>
            <p className="max-w-sm text-center sm:hidden">
              {Object.entries(punishmentTypes)
                .sort(([, a], [, b]) => b.punishment.punishment_type.value - a.punishment.punishment_type.value)
                .map(([_, { amount, punishment }], i) => [
                  <span
                    key={`${punishment.punishment_type_id}/${i}`}
                    className="whitespace-nowrap"
                    title={`${punishment.punishmentType.name} (${punishment.punishmentType.value}kr)`}
                  >
                    <span className="text-xs text-gray-800">{amount}x</span>
                    <span className="text-lg">{punishment.punishmentType.emoji}</span>
                  </span>,
                ])}
            </p>
          </div>
        </div>
        {streak > 2 && (
          <div className="absolute right-12 cursor-default inline-block">
            <span
              className="text-lg"
              title={`${leaderboardUser.first_name} ${leaderboardUser.last_name} har fått straffer ${streak} uker på rad`}
            >
              {streak} 🔥
            </span>
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent>
        <PunishmentList
          userId={leaderboardUser.user_id}
          punishments={leaderboardUser.punishments}
          isGroupContext={false}
          dataRefetch={dataRefetch}
        />
      </AccordionContent>
    </AccordionItem>
  )
}
