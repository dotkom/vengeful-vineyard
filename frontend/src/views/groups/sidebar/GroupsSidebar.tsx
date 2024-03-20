import { Dispatch, FC, SetStateAction } from "react"
import { GroupMembersSortAlternative, groupMembersSortAlternatives } from "../../../helpers/sorting"
import { MultipleToggle, ToggleOption } from "../../../components/toggle/MultipleToggle"

import { CheckBadgeIcon } from "@heroicons/react/20/solid"
import { Group } from "../../../helpers/types"
import { GroupJoinRequestsContainer } from "./GroupJoinRequestsContainer"
import { GroupSettings } from "./GroupSettings"
import { Listbox } from "../../../components/listbox/Listbox"
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
}

export const GroupsSidebar: FC<GroupsSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  toggledPunishmentTypesOptions,
  setToggledPunishmentTypesOptions,
  sortingAlternative,
  setSortingAlternative,
  groupDataIsLoading = false,
  groupData,
}) => {
  const getReadableSortingAlternative = (keyword: GroupMembersSortAlternative) => {
    switch (keyword) {
      case "total_value":
        return "Total straffeverdi"
      case "total_punishments":
        return "Antall straffer"
      default:
        return "Ukjent"
    }
  }

  const listboxOptions = groupMembersSortAlternatives.map((alternative) => ({
    value: alternative,
    label: getReadableSortingAlternative(alternative),
  }))

  return (
    <div className="min-h-32 max-w-[90%] md:max-w-none h-fit bg-white ring-1 ring-gray-900/5 rounded-xl flex flex-col gap-y-6 px-4 py-6">
      <div className="-mb-2 flex flex-row justify-between items-center">
        {!groupDataIsLoading ? (
          <>
            <h1 className="text-gray-700 ml-1 flex flex-row gap-x-1">
              {groupData && groupData.name_short}
              {groupData && groupData.ow_group_id && (
                <span className="text-blue-500">
                  <CheckBadgeIcon className="h-[1.25rem] w-[1.25rem]" title="Denne gruppen er laget gjennom OW" />
                </span>
              )}
            </h1>
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
  )
}
