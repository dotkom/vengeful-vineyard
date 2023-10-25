import { useInfiniteQuery } from "@tanstack/react-query"
import { Table } from "../../components/table"
import axios, { AxiosResponse } from "axios"
import { LEADERBOARD_URL } from "../../helpers/api"
import { Leaderboard } from "../../helpers/types"

export const WallOfShame = () => {
  const getLeaderboard = (url: string) => axios.get(url).then((res: AxiosResponse<Leaderboard>) => res.data)

  const { isLoading, data, refetch, fetchNextPage } = useInfiniteQuery(
    ["leaderboard"],
    ({ pageParam = LEADERBOARD_URL }) => getLeaderboard(pageParam),
    {
      getNextPageParam: (lastPage: Leaderboard, _) => lastPage.next,
    }
  )
  const leaderboardUsers = data?.pages.flatMap((page) => page.results)

  return (
    <section className="mt-16">
      <h1 className="mb-4 text-center text-xl font-medium">Wall of shame</h1>
      <Table leaderboardUsers={leaderboardUsers} isLoading={isLoading} dataRefetch={refetch} />
      <button
        className="mt-4 mb-16 text-center text-white bg-red-500 rounded-md px-4 py-2 hover:bg-red-600"
        onClick={() => fetchNextPage()}
      >
        Last inn flere
      </button>
    </section>
  )
}
