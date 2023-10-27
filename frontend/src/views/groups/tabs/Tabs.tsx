import { PlusIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"
import { Fragment, useEffect, useState } from "react"
import { Group } from "../../../helpers/types"
import { TabItem } from "./TabItem"
import { SkeletonTabItem } from "./SkeletonTabItem"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "@tanstack/react-query"
import { IconButton } from "../../../components/button"
import { GivePunishmentModal } from "./modal/GivePunishmentModal"
import { RegisterPaymentModal } from "./modal/RegisterPaymentModal"

interface TabsProps {
  selectedGroup: Group | undefined
  setSelectedGroup: (group: Group) => void
  groups?: Group[]
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>
}

export const Tabs = ({ selectedGroup, setSelectedGroup, groups, dataRefetch }: TabsProps) => {
  const [givePunishmentOpen, setGivePunishmentOpen] = useState(false)
  const [registerPaymentOpen, setRegisterPaymentOpen] = useState(false)

  useEffect(() => {
    if (selectedGroup === undefined && groups) setSelectedGroup(groups[0])
  }, [groups])

  return (
    <Fragment>
      {givePunishmentOpen && selectedGroup && (
        <GivePunishmentModal
          open={givePunishmentOpen}
          setOpen={setGivePunishmentOpen}
          selectedGroup={selectedGroup}
          dataRefetch={dataRefetch}
        />
      )}

      {registerPaymentOpen && selectedGroup && (
        <RegisterPaymentModal
          open={registerPaymentOpen}
          setOpen={setRegisterPaymentOpen}
          selectedGroup={selectedGroup}
          dataRefetch={dataRefetch}
        />
      )}

      <div className="mx-4 max-w-5xl md:m-auto md:px-8">
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
                    <IconButton label="Ny straff" onClick={() => setGivePunishmentOpen(true)}>
                      <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    </IconButton>
                    <IconButton label="Registrer betaling" onClick={() => setRegisterPaymentOpen(true)}>
                      <CurrencyDollarIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
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
