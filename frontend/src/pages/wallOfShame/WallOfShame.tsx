import { Table } from "../../components/table"
import { useAuth } from "react-oidc-context"
import { useEffect } from "react"
import { useLeaderboard } from "../../helpers/api"

export const WallOfShame = () => {
  const auth = useAuth()
  const { isLoading, isFetching, data, refetch, fetchNextPage } = useLeaderboard({ enabled: auth.isAuthenticated })

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
    <section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <h1 className="mb-4 text-center md:text-xl font-medium text-black">Wall of shame</h1>
      <Table leaderboardUsers={leaderboardUsers} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  )
}
