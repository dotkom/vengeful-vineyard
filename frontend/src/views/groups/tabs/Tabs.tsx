import { Fragment, useEffect } from "react"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"

import { GivePunishmentModal } from "./modal/GivePunishmentModal"
import { Group } from "../../../helpers/types"
import { IconButton } from "../../../components/button"
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

      <div className="mx-4 max-w-5xl md:m-auto pl-8 pr-4">
        <div className="sm:block">
          <div>
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
                  <div className="w-full flex flex-row gap-x-2 mb-1 justify-end">
                    <IconButton label="Ny straff" onClick={() => setOpen(true)}>
                      <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    </IconButton>
                  </div>
                </>
              ) : (
                <SkeletonTabItem />
              )}
            </nav>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
