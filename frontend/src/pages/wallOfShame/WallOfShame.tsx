import { useAuth } from "react-oidc-context"
import { useLeaderboard } from "../../helpers/api"
import { LeaderboardTable } from "../../components/leaderboardtable"

export const WallOfShame = () => {
  const auth = useAuth()
  const { isFetching, data, refetch, fetchNextPage } = useLeaderboard({ enabled: auth.isAuthenticated })

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
