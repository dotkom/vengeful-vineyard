import { CommitteeCard } from "./CommitteeCard"
import { useAuth } from "react-oidc-context"
import { GroupStatistics } from "../../helpers/types"
import NoImage from "../../assets/NoImage.png"
import { committeesQuery } from "../../helpers/api"
import { useQuery } from "@tanstack/react-query"

export const CommitteeList = () => {
  const auth = useAuth()

  const { data: groupsStatistics } = useQuery({
    ...committeesQuery(),
    enabled: auth.isAuthenticated,
  })

  return (
    <div className="flex flex-wrap -m-2 gap-16 justify-center">
      {groupsStatistics?.length == 0 ? (
        <div className="flex flex-col items-center justify-center p-4">
          <p className="text-gray-800">Ingen resultat</p>
        </div>
      ) : (
        groupsStatistics
          ?.sort((a, b) => b.total_value_this_year - a.total_value_this_year)
          ?.map((groupStatistic: GroupStatistics, index) => (
            <CommitteeCard
              image={groupStatistic.group_image === "NoImage" ? (NoImage as string) : groupStatistic.group_image}
              name={groupStatistic.group_name_short}
              total_value={groupStatistic.total_value}
              total_value_this_year={groupStatistic.total_value_this_year}
              key={index}
            />
          ))
      )}
    </div>
  )
}
