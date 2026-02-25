import { Dispatch, FC, SetStateAction } from "react"
import { GroupMembersSortAlternative } from "../../../helpers/sorting"
import { ToggleOption } from "../../../components/toggle/MultipleToggle"

import { CheckBadgeIcon } from "@heroicons/react/20/solid"
import { Group, GroupUser, PunishmentType } from "../../../helpers/types"
import { GroupJoinRequestsContainer } from "./GroupJoinRequestsContainer"
import { GroupSettings } from "./GroupSettings"
import { LatestPunishments } from "./LatestPunishments"
import { PlayModeSection } from "./PlayModeSection"
import { SidebarSection } from "./SidebarSection"
import { TextInput } from "../../../components/input/TextInput"

interface GroupsSidebarProps {
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  toggledPunishmentTypesOptions: ToggleOption<string>[]
  setToggledPunishmentTypesOptions: Dispatch<SetStateAction<ToggleOption<string>[]>>
  sortingAlternative: GroupMembersSortAlternative
  setSortingAlternative: Dispatch<SetStateAction<GroupMembersSortAlternative>>
  groupDataIsLoading?: boolean
  groupData: Group | undefined
  members?: GroupUser[]
}

function getTotalUnpaidValue(
  members: GroupUser[],
  punishmentTypes: Record<string, PunishmentType>,
): number {
  return members.reduce((total, member) => {
    return total + member.punishments.reduce((acc, p) => {
      return p.paid ? acc : acc + punishmentTypes[p.punishment_type_id].value * p.amount
    }, 0)
  }, 0)
}

export const GroupsSidebar: FC<GroupsSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  groupDataIsLoading = false,
  groupData,
  members = [],
}) => {
  const activeMembers = groupData?.members.filter((m) => m.active) ?? []
  const totalUnpaid = groupData
    ? getTotalUnpaidValue(activeMembers, groupData.punishment_types)
    : 0

  return (
    <div className="flex flex-col gap-y-4">
      <div className="min-h-32 max-w-[90%] md:max-w-none h-fit bg-white ring-1 ring-gray-900/5 rounded-xl flex flex-col gap-y-6 px-4 py-6">
        <div className="-mb-2 flex flex-row justify-between items-center">
          {!groupDataIsLoading ? (
            <>
              <h1 className="text-gray-700 ml-1 flex flex-row gap-x-1 items-center">
                {groupData && groupData.name_short}
                {groupData && groupData.ow_group_id && (
                  <span className="text-blue-500">
                    <CheckBadgeIcon className="h-[1.25rem] w-[1.25rem]" title="Denne gruppen er laget gjennom OW" />
                  </span>
                )}
              </h1>
              {groupData && (
                <span className="text-sm font-normal text-gray-900 dark:text-gray-200 ml-auto mr-2">
                  {totalUnpaid} kr
                </span>
              )}
              <div className="flex flex-row gap-x-3">
                <GroupJoinRequestsContainer groupData={groupData} />
                <GroupSettings groupData={groupData} />
              </div>
            </>
          ) : (
            <div className="bg-slate-300 rounded-xl animate-pulse w-24 h-6"></div>
          )}
        </div>

        <div className="h-px w-full bg-gray-300 opacity-50"></div>

        <SidebarSection title="Søk">
          <TextInput
            placeholder="Søk etter en bruker"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </SidebarSection>

        <PlayModeSection members={members} groupData={groupData} />

        {/*

        <SidebarSection title="Sorter etter">
          <Listbox value={sortingAlternative} onChange={setSortingAlternative} options={listboxOptions} />
        </SidebarSection>

        <SidebarSection title="Filtrer">
          <MultipleToggle
            options={toggledPunishmentTypesOptions}
            onOptionClicked={(option) =>
              setToggledPunishmentTypesOptions([
                ...toggledPunishmentTypesOptions.map((o) =>
                  o.value === option.value ? { ...o, checked: !o.checked } : o
                ),
              ])
            }
            isLoading={groupDataIsLoading}
          />
        </SidebarSection>
        */}
      </div>

      <LatestPunishments groupData={groupData} />
    </div>
  )
}
