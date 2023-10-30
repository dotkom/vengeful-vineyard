import { useQuery } from "@tanstack/react-query"
import { Table } from "../../components/table"
import { getGroupLeaderboardUrl, getMeUrl } from "../../helpers/api"
import axios, { AxiosResponse } from "axios"
import { Group, User } from "../../helpers/types"
import { useContext, useEffect } from "react"
import { Tabs } from "./tabs/Tabs"
import { UserContext } from "../../helpers/userContext"
import { useNavigate, useParams } from "react-router-dom"
import { sortGroupUsers, sortGroups } from "../../helpers/sorting"
import { useOptimisticQuery } from "../../helpers/optimisticQuery"

export const GroupsView = () => {
  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const params = useParams<{ groupName?: string }>()
  const selectedGroupName = params.groupName

  const { data: user } = useOptimisticQuery<User>(["groupsData"], (_, optimistic: boolean) =>
    axios.get(getMeUrl(optimistic)).then((res: AxiosResponse<User>) => {
      const user = res.data
      setUser({ user_id: user.user_id })
      user.groups = sortGroups(user.groups)
      user.groups.forEach((group) => (group.members = sortGroupUsers(group.members, group.punishment_types)))
      return user
    })
  )

  useEffect(() => {
    if (user && selectedGroupName === undefined) {
      navigate(`/komiteer/${user.groups[0].name_short.toLowerCase()}`)
    }
  }, [user, selectedGroupName])

  const selectedGroup = user?.groups.find(
    (group) => group.name_short.toLowerCase() === selectedGroupName?.toLowerCase()
  )

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["groupLeaderboard", selectedGroup?.group_id],
    queryFn: () =>
      axios.get(getGroupLeaderboardUrl(selectedGroup!.group_id)).then((res: AxiosResponse<Group>) => {
        const group = res.data
        group.members = sortGroupUsers(group.members, group.punishment_types)
        return group
      }),
    enabled: !!user && !!selectedGroup,
  })

  return (
    <section className="mt-16">
      <Tabs
        selectedGroup={selectedGroup}
        setSelectedGroup={(group: Group) => group && navigate(`/komiteer/${group.name_short.toLowerCase()}`)}
        groups={user ? user.groups : undefined}
        dataRefetch={refetch}
      />
      <Table groupData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  )
}
