import { CommitteeCard } from "./CommitteeCard"
import { useAuth } from "react-oidc-context"
import { useCommittees } from "../../helpers/api"
import { GroupStatistics } from "../../helpers/types"

export const CommitteeList = () => {
  const auth = useAuth()
  const { data: groupsStatistics } = useCommittees({ enabled: auth.isAuthenticated })

  const filteredGroupsStatistics = groupsStatistics?.filter(
    (groupStatistic) => groupStatistic.group_image && groupStatistic.group_image != "NoImage"
  )
  return (
    <div className="flex flex-wrap -m-2 gap-16 justify-center">
      {filteredGroupsStatistics?.length == 0 ? (
        <div className="flex flex-col items-center justify-center p-4">
          <p className="text-gray-800">Ingen resultat</p>
        </div>
      ) : (
        filteredGroupsStatistics?.map((groupStatistic: GroupStatistics, index) => (
          <CommitteeCard
            key={index}
            name={groupStatistic.group_name_short}
            amount={groupStatistic.total_value}
            imgurl={groupStatistic.group_image}
          />
        ))
      )}
    </div>
  )
}
