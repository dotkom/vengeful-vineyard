import { useQueryClient } from "@tanstack/react-query"

import { useEffect } from "react"
import { classNames } from "../../../helpers/classNames"
import { Group } from "../../../helpers/types"
import { AdditionalGroupNavItem } from "./AdditionalGroupNavItem"
import { SkeletonTabNavItem } from "./SkeletonTabNavItem"
import { TabNavItem } from "./TabNavItem"
import { groupLeaderboardQuery } from "../../../helpers/api"

interface TabNavProps {
  selectedGroup: Group | undefined
  setSelectedGroup: (group: Group) => void
  groups?: Group[]
  disableAutoNavigate?: boolean
}

export const TabNav = ({ selectedGroup, setSelectedGroup, groups, disableAutoNavigate }: TabNavProps) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (selectedGroup === undefined && groups && !disableAutoNavigate) setSelectedGroup(groups[0])
  }, [groups, disableAutoNavigate])

  const prefetchGroup = (group: Group) => queryClient.prefetchQuery(groupLeaderboardQuery(group.group_id))

  return (
    <>
      <div className="mx-auto w-[86%] md:w-[90%]">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-x-6 items-center w-full">
            <nav className="flex flex-row items-center gap-x-3 md:gap-x-6 w-full" aria-label="TabNavs">
              {groups !== undefined ? (
                <>
                  <div
                    className={classNames(
                      "flex flex-row gap-x-3 md:gap-x-4 items-center overflow-x-auto lowkey-scrollbar [@media(max-width:767px)]:scrollbar-hide",
                      "with-horizontal-scroll-shadow"
                    )}
                  >
                    {groups.map((group) => (
                      <TabNavItem
                        key={group.name_short}
                        group={group}
                        selectedGroup={selectedGroup}
                        onClick={() => setSelectedGroup(group)}
                        onMouseOver={() => prefetchGroup(group)}
                        onFocus={() => prefetchGroup(group)}
                      />
                    ))}
                  </div>
                  {/* <AdditionalGroupNavItem /> */}
                </>
              ) : (
                <SkeletonTabNavItem />
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
