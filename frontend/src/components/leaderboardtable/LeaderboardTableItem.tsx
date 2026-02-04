import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useQuery } from "@tanstack/react-query"
import { LeaderboardPunishment, LeaderboardUser } from "../../helpers/types"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../accordion/Accordion"

import { textToEmoji } from "../../helpers/emojies"
import { PunishmentList } from "../punishment/PunishmentList"
import axios from "axios"
import { getLeaderboardUserPunishmentsUrl } from "../../helpers/api"

interface TableItemProps {
  leaderboardUser: LeaderboardUser
  isCurrentlyExpanded: boolean
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  i?: number
}

export const LeaderboardTableItem = ({ leaderboardUser, isCurrentlyExpanded, dataRefetch, i }: TableItemProps) => {
  const displayName = `${leaderboardUser.first_name} ${leaderboardUser.last_name}`
  const { total_value: totalValue, emojis } = leaderboardUser

  const {
    data: punishments,
    isLoading: isLoadingPunishments,
    refetch: punishmentsRefetch,
  } = useQuery<LeaderboardPunishment[]>(
    ["leaderboardUserPunishments", leaderboardUser.user_id],
    () => axios.get(getLeaderboardUserPunishmentsUrl(leaderboardUser.user_id)).then((res) => res.data),
    { enabled: isCurrentlyExpanded, staleTime: 1000 * 60 }
  )

  const countOfEachEmojiInString = (str: string) => {
    const counts: Record<string, number> = {}
    for (const char of str) {
      counts[char] = counts[char] ? counts[char] + 1 : 1
    }
    return counts
  }

  const emojisCounts = countOfEachEmojiInString(emojis)
  const sortedEmojis = Object.entries(emojisCounts)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)

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
              : textToEmoji(displayName)}
          </span>
          <div className="flex flex-col text-left">
            <p
              className="w-32 md:w-44 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs md:text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
              title={displayName}
            >
              {displayName}
            </p>
            <span className="text-gray-700 text-xs">{totalValue}kr</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col items-end">
            <p className="max-w-sm text-center hidden sm:block">{emojis}</p>
            <p className="max-w-sm text-center sm:hidden flex flex-row flex-wrap gap-x-2">
              {sortedEmojis.map(({ emoji, count }) => (
                <span key={emoji}>
                  {emoji}
                  {count}
                </span>
              ))}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <PunishmentList
          userId={leaderboardUser.user_id}
          punishments={punishments || []}
          isLoadingPunishments={isLoadingPunishments}
          isGroupContext={false}
          dataRefetch={punishmentsRefetch}
        />
      </AccordionContent>
    </AccordionItem>
  )
}
