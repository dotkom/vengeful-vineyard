import { useAuth } from "react-oidc-context"
import { LeaderboardTable } from "../../components/leaderboardtable"
import { useInfiniteQuery } from "@tanstack/react-query"
import { leaderboardQuery } from "../../helpers/api"

export const WallOfShame = () => {
  const { isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(leaderboardQuery())

  const leaderboardUsers = data?.pages.flatMap((page) => page.results)

  return (
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <h1 className="mb-4 text-center md:text-xl font-medium text-black">Wall of Shame</h1>
      <LeaderboardTable
        leaderboardUsers={leaderboardUsers}
        isFetching={isFetching}
        dataRefetch={refetch}
        fetchNextPage={fetchNextPage}
      />
    </section>
  )
}
