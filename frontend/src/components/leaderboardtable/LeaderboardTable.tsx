import * as Accordion from "@radix-ui/react-accordion"

import { LeaderboardUser } from "../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { SkeletonTableItem } from "./SkeletonTableItem"
import { LeaderboardTableItem } from "./LeaderboardTableItem"

interface LeaderboardTableProps {
  leaderboardUsers?: LeaderboardUser[] | undefined
  isLoading: boolean
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
}

export const LeaderboardTable = ({ leaderboardUsers, isLoading = false, dataRefetch }: LeaderboardTableProps) => {
  return (
    <ul role="list">
      <Accordion.Root
        type="single"
        defaultValue="item-1"
        collapsible
        className="divide-y divide-gray-100 dark:divide-gray-700 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg md:rounded-xl"
      >
        {leaderboardUsers?.map((user, i) => (
          <LeaderboardTableItem key={user.user_id} leaderboardUser={user} dataRefetch={dataRefetch} i={i} />
        ))}

        {leaderboardUsers && leaderboardUsers.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-gray-800">Ingen resultat</p>
          </div>
        )}

        {isLoading && [...Array(3)].map((e, i) => <SkeletonTableItem key={i} />)}
      </Accordion.Root>
    </ul>
  )
}
