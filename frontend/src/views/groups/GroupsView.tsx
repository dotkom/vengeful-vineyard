import { Table } from "../../components/table"
import { useGroupLeaderboard, useMyGroups } from "../../helpers/api"
import { Group } from "../../helpers/types"
import { useContext, useEffect } from "react"
import { Tabs } from "./tabs/Tabs"
import { UserContext } from "../../helpers/userContext"
import { useNavigate, useParams } from "react-router-dom"

export const GroupsView = () => {
  const { setUserContext } = useContext(UserContext)
  const navigate = useNavigate()

  const params = useParams<{ groupName?: string }>()
  const selectedGroupName = params.groupName

  const { data: user } = useMyGroups()

  useEffect(() => {
    if (user) setUserContext({ user_id: user.user_id })
    if (user && selectedGroupName === undefined) {
      navigate(`/komiteer/${user.groups[0].name_short.toLowerCase()}`)
    }
  }, [user, selectedGroupName])

  const selectedGroup = user?.groups.find(
    (group) => group.name_short.toLowerCase() === selectedGroupName?.toLowerCase()
  )

  const { isLoading, data, refetch } = useGroupLeaderboard(selectedGroup?.group_id)

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
