import * as Accordion from "@radix-ui/react-accordion"

import { LeaderboardUser } from "../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { SkeletonTableItem } from "./SkeletonTableItem"
import { LeaderboardTableItem } from "./LeaderboardTableItem"
import { useEffect, useRef } from "react"

interface LeaderboardTableProps {
  leaderboardUsers?: LeaderboardUser[] | undefined
  isFetching: boolean
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
  fetchNextPage: () => Promise<QueryObserverResult<any, unknown>>
}

export const LeaderboardTable = ({
  leaderboardUsers,
  isFetching,
  dataRefetch,
  fetchNextPage,
}: LeaderboardTableProps) => {
  const ref = useRef<HTMLUListElement>(null)

  useEffect(() => {
    document.addEventListener("scroll", () => {
      if (ref.current && !isFetching) {
        const lastItem = ref.current.firstElementChild?.lastElementChild
        if (lastItem && lastItem.getBoundingClientRect().top < window.innerHeight) {
          fetchNextPage().then()
        }
      }
    })
  }, [])

  return (
    <ul role="list" ref={ref}>
      <Accordion.Root
        type="single"
        defaultValue="item-1"
        collapsible
        className="divide-y divide-gray-100 dark:divide-gray-700 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg md:rounded-xl"
      >
        {leaderboardUsers?.map((user, i) => (
          <LeaderboardTableItem key={user.user_id} leaderboardUser={user} dataRefetch={dataRefetch} i={i} />
        ))}

        {leaderboardUsers && leaderboardUsers.length === 0 && !isFetching && (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-gray-800">Ingen resultat</p>
          </div>
        )}

        {isFetching && [...Array(3)].map((e, i) => <SkeletonTableItem key={i} />)}
      </Accordion.Root>
    </ul>
  )
}
