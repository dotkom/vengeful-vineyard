import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useQueryClient } from "@tanstack/react-query"

import { AdditionalGroupNavItem } from "./AdditionalGroupNavItem"
import { GivePunishmentModal } from "../modal/GivePunishmentModal"
import { Group } from "../../../helpers/types"
import { SkeletonTabNavItem } from "./SkeletonTabNavItem"
import { TabNavItem } from "./TabNavItem"
import { classNames } from "../../../helpers/classNames"
import { useEffect } from "react"
import { useGivePunishmentModal } from "../../../helpers/context/modal/givePunishmentModalContext"
import axios from "axios"
import { getGroupUrl } from "../../../helpers/api"

interface TabNavProps {
  selectedGroup: Group | undefined
  setSelectedGroup: (group: Group) => void
  groups?: Group[]
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>
}

export const TabNav = ({ selectedGroup, setSelectedGroup, groups, dataRefetch }: TabNavProps) => {
  const { open, setOpen } = useGivePunishmentModal()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (selectedGroup === undefined && groups) setSelectedGroup(groups[0])
  }, [groups])

  const prefetchGroup = async (group: Group) => {
    queryClient.prefetchQuery(
      ["groupLeaderboard", group.group_id],
      () => {
        return axios.get(getGroupUrl(group.group_id)).then((res) => res.data)
      },
      {
        staleTime: 1000 * 60 * 5,
      }
    )
  }

  return (
    <>
      {open && selectedGroup && (
        <GivePunishmentModal open={open} setOpen={setOpen} selectedGroup={selectedGroup} dataRefetch={dataRefetch} />
      )}

      <div className="mx-auto w-[86%] md:w-[90%]">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-x-6 items-center w-full">
            <nav className="flex flex-row items-center gap-x-3 md:gap-x-6 w-full" aria-label="TabNavs">
              {groups !== undefined ? (
                <>
                  <div
                    className={classNames(
                      "flex flex-row gap-x-3 md:gap-x-8 items-center overflow-x-auto scrollbar-hide",
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
                  <AdditionalGroupNavItem />
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
