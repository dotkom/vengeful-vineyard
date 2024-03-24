import * as Accordion from "@radix-ui/react-accordion"

import { LeaderboardUser } from "../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { SkeletonTableItem } from "./SkeletonTableItem"
import { LeaderboardTableItem } from "./LeaderboardTableItem"
import { useState } from "react"

interface LeaderboardTableProps {
  leaderboardUsers?: LeaderboardUser[] | undefined
  isFetching: boolean
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
}

export const LeaderboardTable = ({ leaderboardUsers, isFetching, dataRefetch }: LeaderboardTableProps) => {
  const [currentlyOpen, setCurrentlyOpen] = useState<string | undefined>(undefined)

  return (
    <ul role="list">
      <Accordion.Root
        type="single"
        defaultValue="item-1"
        collapsible
        value={currentlyOpen}
        onValueChange={(value) => setCurrentlyOpen(value)}
        className="divide-y divide-gray-100 dark:divide-gray-700 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg md:rounded-xl"
      >
        {leaderboardUsers?.map((user, i) => (
          <LeaderboardTableItem
            key={user.user_id}
            leaderboardUser={user}
            isCurrentlyExpanded={currentlyOpen === user.user_id}
            dataRefetch={dataRefetch}
            i={i}
          />
        ))}

        {leaderboardUsers && leaderboardUsers.length === 0 && !isFetching && (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-gray-800">Ingen resultat</p>
          </div>
        )}

        {isFetching && !leaderboardUsers && [...Array(3)].map((e, i) => <SkeletonTableItem key={i} />)}
      </Accordion.Root>
    </ul>
  )
}
