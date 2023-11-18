import { Table } from "../../components/table"
import { useLeaderboard } from "../../helpers/api"
import { useEffect } from "react"

export const WallOfShame = () => {
  const { isLoading, isFetching, data, refetch, fetchNextPage } = useLeaderboard()

  const handleScroll = () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
      fetchNextPage().then()
    }
  }

  useEffect(() => {
    if (isFetching) return
    document.addEventListener("wheel", handleScroll, { passive: true })
    return () => document.removeEventListener("wheel", handleScroll)
  }, [fetchNextPage, isFetching])

  const leaderboardUsers = data?.pages.flatMap((page) => page.results)

  return (
    <section className="mt-16">
      <h1 className="mb-4 text-center text-xl font-medium">Wall of shame</h1>
      <Table leaderboardUsers={leaderboardUsers} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  )
}
