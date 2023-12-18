import { DefaultHero } from "../../views/hero"
import { GroupsView } from "../../views/groups"
import { LEADERBOARD_URL } from "../../helpers/api"
import { Leaderboard } from "../../helpers/types"
import { useAuth } from "react-oidc-context"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export const Home = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient
      .prefetchInfiniteQuery(
        ["leaderboard"],
        ({ pageParam = LEADERBOARD_URL }) => fetch(pageParam).then((res) => res.json()),
        {
          getNextPageParam: (lastPage: Leaderboard, _) => lastPage.next,
          staleTime: 1000 * 60 * 5,
        }
      )
      .then()
  }, [])

  if (auth.isAuthenticated) {
    return <GroupsView />
  }

  return <DefaultHero auth={auth} />
}
