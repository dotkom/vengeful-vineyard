import * as Accordion from "@radix-ui/react-accordion"

import { Group, GroupUser, User } from "../../helpers/types"
import { GroupMembersSortAlternative, getSortGroupUsersFunc } from "../../helpers/sorting"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { SkeletonTableItem } from "./SkeletonTableItem"
import { GroupUserTableItem } from "./GroupUserTableItem"

interface TableProps {
  groupData?: Group | undefined
  isLoading: boolean
  searchTerm?: string
  punishmentTypesToShow?: string[]
  sortingAlternative?: GroupMembersSortAlternative
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, any>>
}

const sortInactiveByYear = (a: GroupUser, b: GroupUser): number => {
  const aYear = a.inactive_at ? new Date(a.inactive_at).getTime() : 0
  const bYear = b.inactive_at ? new Date(b.inactive_at).getTime() : 0
  return bYear - aYear // Most recent first
}

export const GroupUserTable = ({
  groupData,
  isLoading = false,
  searchTerm,
  sortingAlternative,
  dataRefetch,
}: TableProps) => {
  const filterUsers = (user: User): boolean => {
    if (!searchTerm) return true

    const fullName = `${user.first_name} ${user.last_name}`
    return fullName.toLowerCase().includes(searchTerm.toLowerCase())
  }

  const activeMembers = groupData?.members.filter((user) => user.active) ?? []
  const inactiveMembers = groupData?.members.filter((user) => !user.active) ?? []
  const isOwGroup = !!groupData?.ow_group_id

  return (
    <ul role="list">
      <Accordion.Root
        type="single"
        defaultValue="item-1"
        collapsible
        className="divide-y divide-gray-100 dark:divide-gray-700 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg md:rounded-xl"
      >
        {activeMembers
          .filter(filterUsers)
          .sort(getSortGroupUsersFunc(groupData?.punishment_types, sortingAlternative))
          .map((user) => (
            <GroupUserTableItem
              key={user.user_id}
              groupUser={user}
              groupData={groupData!}
              punishmentTypes={groupData!.punishment_types}
              dataRefetch={dataRefetch}
            />
          ))}

        {groupData && activeMembers.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center p-4">
            <p className="text-gray-800">Ingen resultat</p>
          </div>
        )}

        {isLoading && [...Array(3)].map((e, i) => <SkeletonTableItem key={i} />)}
      </Accordion.Root>

      {isOwGroup && inactiveMembers.length > 0 && (
        <>
          <h3 className="mt-6 mb-2 ml-1 text-sm font-medium text-gray-500">Tidligere medlemmer</h3>
          <Accordion.Root
            type="single"
            collapsible
            className="divide-y divide-gray-100 dark:divide-gray-700 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg md:rounded-xl"
          >
            {inactiveMembers
              .filter(filterUsers)
              .sort(sortInactiveByYear)
              .map((user) => (
                <GroupUserTableItem
                  key={user.user_id}
                  groupUser={user}
                  groupData={groupData!}
                  punishmentTypes={groupData!.punishment_types}
                  dataRefetch={dataRefetch}
                  isInactive
                />
              ))}
          </Accordion.Root>
        </>
      )}
    </ul>
  )
}
