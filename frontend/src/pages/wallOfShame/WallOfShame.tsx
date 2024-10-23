import { LeaderboardTable } from "../../components/leaderboardtable"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { leaderboardQuery, userQuery } from "../../helpers/api"
import { Button } from "../../components/button/Button"
import { useCurrentUser } from "../../helpers/context/currentUserContext"
import { useEffect, useState } from "react"

export const WallOfShame = () => {
  const { setCurrentUser } = useCurrentUser()
  const [filter, setFilter] = useState<"year" | "alltime">("year")

  useQuery({
    ...userQuery(),
    onSuccess: ({ user_id }) => {
      if (!user_id) return

      setCurrentUser({ user_id })
    },
  })

  const { isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(leaderboardQuery(filter === "year"))

  useEffect(() => {
    refetch()
  }, [filter, refetch])

  const leaderboardUsers = data?.pages.flatMap((page) => page.results)

  const filteredLeaderboardUsers = leaderboardUsers?.map((user) => {
    if (filter === "year") {
      return {
        ...user,
        total_value: user.total_value_this_year,
        emojis: user.emojis_this_year,
        amount_punishments: user.amount_punishments_this_year,
        amount_unique_punishments: user.amount_unique_punishments_this_year,
      }
    }
    return user
  })

  const year = new Date().getFullYear()

  return (
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <div className="relative flex justify-center items-center mb-4">
        <div className="absolute left-0 flex space-x-2 text-sm mt-1">
          <button
            onClick={() => setFilter("year")}
            className={`w-24 border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400 ${
              filter === "year" ? "bg-slate-100 dark:bg-slate-800" : ""
            }`}
          >
            {year}
          </button>
          <button
            onClick={() => setFilter("alltime")}
            className={`w-24 border border-gray-200 dark:border-gray-600 py-1 rounded-lg bg-white dark:text-slate-400  ${
              filter === "alltime" ? "bg-slate-100 dark:bg-slate-800" : ""
            }`}
          >
            All time
          </button>
        </div>
        <h1 className="text-center md:text-3xl font-medium text-black">Wall of Shame</h1>
      </div>
      <LeaderboardTable leaderboardUsers={filteredLeaderboardUsers} isFetching={isFetching} dataRefetch={refetch} />
      <Button variant="OUTLINE" onClick={() => fetchNextPage().then()} className="mx-auto mt-4">
        Last inn mer
      </Button>
    </section>
  )
}
