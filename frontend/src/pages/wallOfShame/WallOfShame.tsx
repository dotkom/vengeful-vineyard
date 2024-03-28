import { LeaderboardTable } from "../../components/leaderboardtable"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { leaderboardQuery, userQuery } from "../../helpers/api"
import { Button } from "../../components/button/Button"
import { useCurrentUser } from "../../helpers/context/currentUserContext"

export const WallOfShame = () => {
  const { setCurrentUser } = useCurrentUser()

  useQuery({
    ...userQuery(),
    onSuccess: ({ user_id }) => {
      if (!user_id) return

      setCurrentUser({ user_id })
    },
  })

  const { isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(leaderboardQuery())

  const leaderboardUsers = data?.pages.flatMap((page) => page.results)

  return (
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <h1 className="mb-4 text-center md:text-xl font-medium text-black">Wall of Shame</h1>
      <LeaderboardTable leaderboardUsers={leaderboardUsers} isFetching={isFetching} dataRefetch={refetch} />
      <Button variant="OUTLINE" onClick={() => fetchNextPage().then()} className="mx-auto mt-4">
        Last inn mer
      </Button>
    </section>
  )
}
