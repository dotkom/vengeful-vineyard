import { Fragment, useEffect } from "react"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { GivePunishmentModal } from "./modal/GivePunishmentModal"
import { Group } from "../../../helpers/types"
import { PlusIcon } from "@heroicons/react/24/outline"
import { SkeletonTabItem } from "./SkeletonTabItem"
import { TabItem } from "./TabItem"
import { useGivePunishmentModal } from "../../../helpers/givePunishmentModalContext"

interface TabsProps {
  selectedGroup: Group | undefined
  setSelectedGroup: (group: Group) => void
  groups?: Group[]
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>
}

export const Tabs = ({ selectedGroup, setSelectedGroup, groups, dataRefetch }: TabsProps) => {
  const { open, setOpen } = useGivePunishmentModal()

  useEffect(() => {
    if (selectedGroup === undefined && groups) setSelectedGroup(groups[0])
  }, [groups])

  return (
    <Fragment>
      {open && selectedGroup && (
        <GivePunishmentModal open={open} setOpen={setOpen} selectedGroup={selectedGroup} dataRefetch={dataRefetch} />
      )}

      <div className="mx-4 md:pl-8 md:pr-4">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-x-6 items-center">
            <nav className="flex space-x-4 md:space-x-8 items-center" aria-label="Tabs">
              {groups !== undefined ? (
                <>
                  {groups.map((group) => (
                    <TabItem
                      key={group.name_short}
                      group={group}
                      selectedGroup={selectedGroup}
                      onClick={() => setSelectedGroup(group)}
                    />
                  ))}
                  {/* <div className="w-full flex flex-row gap-x-2 mb-1 justify-end">
                    <IconButton label="Ny straff" onClick={() => setOpen(true)}>
                      <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    </IconButton>
                  </div> */}
                </>
              ) : (
                <SkeletonTabItem />
              )}
            </nav>
            <button className="h-full flex flex-row mb-2 opacity-60 hover:opacity-90">
              <PlusIcon className="h-[1.4rem] w-[1.4rem]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
