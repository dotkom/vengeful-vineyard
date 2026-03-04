import { CommitteeCard } from "./CommitteeCard"
import { useAuth } from "react-oidc-context"
import { GroupStatistics } from "../../helpers/types"
import NoImage from "../../assets/NoImage.png"
import { committeesQuery } from "../../helpers/api"
import { useQuery } from "@tanstack/react-query"
import { SkeletonCommitteeCard } from "./SkeletonCommitteeCard"

interface CommitteeListProps {
  gamblingOnly?: boolean
}

export const CommitteeList = ({ gamblingOnly = false }: CommitteeListProps) => {
  const auth = useAuth()

  const { data: groupsStatistics, isLoading } = useQuery({
    ...committeesQuery(gamblingOnly),
    enabled: auth.isAuthenticated,
  })

  // Ref: Notion - Møtereferat: January 28, 2026 - Dotkom Kron eller Mynt gambling
  const isDotkom = (group: GroupStatistics) => gamblingOnly && group.group_name_short === "Dotkom"
  const dotkomExtraAllTime = (group: GroupStatistics) => (isDotkom(group) ? 5158 : 0)
  const dotkomExtraThisYear = (group: GroupStatistics) =>
    isDotkom(group) && new Date().getFullYear() === 2026 ? 5158 : 0

  return (
    <div className="flex flex-wrap -m-2 gap-16 justify-center">
      {groupsStatistics?.length == 0 ? (
        <div className="flex flex-col items-center justify-center p-4">
          <p className="text-gray-800">Ingen resultat</p>
        </div>
      ) : (
        groupsStatistics
          ?.sort((a, b) => b.total_value_this_year + dotkomExtraThisYear(b) - (a.total_value_this_year + dotkomExtraThisYear(a)))
          ?.map((groupStatistic: GroupStatistics, index) => (
            <CommitteeCard
              image={groupStatistic.group_image === "NoImage" ? (NoImage as string) : groupStatistic.group_image}
              name={groupStatistic.group_name_short}
              total_value={groupStatistic.total_value + dotkomExtraAllTime(groupStatistic)}
              total_value_this_year={groupStatistic.total_value_this_year + dotkomExtraThisYear(groupStatistic)}
              key={index}
            />
          ))
      )}

      {isLoading && !groupsStatistics && [...Array(8)].map((e, i) => <SkeletonCommitteeCard key={i} />)}
    </div>
  )
}
