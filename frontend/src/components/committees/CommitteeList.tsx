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
        groupsStatistics?.map((groupStatistic: GroupStatistics, index) => (
          <CommitteeCard
            key={index}
            name={groupStatistic.group_name_short}
            amount={groupStatistic.total_value}
            img={groupStatistic.group_image === "NoImage" ? (NoImage as string) : groupStatistic.group_image}
          />
        ))
      )}
    </div>
  )
}
