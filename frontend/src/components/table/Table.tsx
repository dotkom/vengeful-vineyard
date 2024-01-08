import * as Accordion from "@radix-ui/react-accordion"

import { Group, LeaderboardUser, PunishmentType, User } from "../../helpers/types"
import { GroupMembersSortAlternative, getSortGroupUsersFunc } from "../../helpers/sorting"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { SkeletonTableItem } from "./SkeletonTableItem"
import { TableItem } from "./TableItem"

interface TableProps {
  groupData?: Group | undefined
  leaderboardUsers?: LeaderboardUser[] | undefined
  isLoading: boolean
  searchTerm?: string
  punishmentTypesToShow?: string[]
  sortingAlternative?: GroupMembersSortAlternative
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>
}

export const Table = ({
  groupData,
  leaderboardUsers,
  isLoading = false,
  searchTerm,
  punishmentTypesToShow,
  sortingAlternative,
  dataRefetch,
}: TableProps) => {
  const filterUsers = (user: User): boolean => {
    if (!searchTerm) return true

    const fullName = `${user.first_name} ${user.last_name}`
    return fullName.toLowerCase().includes(searchTerm.toLowerCase())
  }

  let punishmentTypesMap = new Map<string, PunishmentType>()

  if (groupData && punishmentTypesToShow) {
    groupData?.punishment_types.forEach((punishmentType) => {
      if (punishmentTypesToShow.includes(punishmentType.punishment_type_id.toString())) {
        punishmentTypesMap.set(punishmentType.punishment_type_id, punishmentType)
      }
    })
  }

  const hasAnyRows = (groupData?.members.length ?? 0) !== 0 || (leaderboardUsers?.length ?? 0) !== 0

  return (
    <ul role="list">
      <Accordion.Root
        type="single"
        defaultValue="item-1"
        collapsible
        className="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg md:rounded-xl"
      >
        {groupData?.members
          .filter(filterUsers)
          .sort(getSortGroupUsersFunc(punishmentTypesMap, sortingAlternative))
          .map((user) => (
            <TableItem
              key={user.user_id}
              groupUser={user}
              groupData={groupData}
              punishmentTypes={Array.from(punishmentTypesMap.values())}
              dataRefetch={dataRefetch}
            />
          ))}

        {leaderboardUsers?.map((user, i) => (
          <TableItem key={user.user_id} punishmentTypes={[]} leaderboardUser={user} dataRefetch={dataRefetch} i={i} />
        ))}

        {!hasAnyRows && !isLoading && (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-gray-800">Ingen resultat</p>
          </div>
        )}

        {isLoading && [...Array(3)].map((e, i) => <SkeletonTableItem key={i} />)}
      </Accordion.Root>
    </ul>
  )
}
