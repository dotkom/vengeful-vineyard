import { useQuery } from "@tanstack/react-query"
import { Table } from "../../components/table"
import axios, { AxiosResponse } from "axios"
import { LEADERBOARD_URL } from "../../helpers/api"
import { Leaderboard } from "../../helpers/types"
import { useEffect } from "react"

export const WallOfShame = () => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: ["wallOfShame"],
    queryFn: () => axios.get(LEADERBOARD_URL).then((res: AxiosResponse<Leaderboard>) => res.data),
  })

  useEffect(() => {
    for (let i = 0; i < 2; i++) {
      axios.get(LEADERBOARD_URL)
    }
  }, [])

  return (
    <section className="mt-16">
      <h1 className="mb-4 text-center text-xl font-medium">Wall of shame</h1>
      <Table leaderboardData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  )
}
