import { useInfiniteQuery } from "@tanstack/react-query"
import { Table } from "../../components/table"
import axios, { AxiosResponse } from "axios"
import { LEADERBOARD_URL } from "../../helpers/api"
import { Leaderboard } from "../../helpers/types"
import { useEffect } from "react"

export const WallOfShame = () => {
  const getLeaderboard = (url: string) => axios.get(url).then((res: AxiosResponse<Leaderboard>) => res.data)

  const { isLoading, isFetching, data, refetch, fetchNextPage } = useInfiniteQuery(
    ["leaderboard"],
    ({ pageParam = LEADERBOARD_URL }) => getLeaderboard(pageParam),
    {
      getNextPageParam: (lastPage: Leaderboard, _) => lastPage.next,
      staleTime: 1000 * 60,
    }
  )

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
