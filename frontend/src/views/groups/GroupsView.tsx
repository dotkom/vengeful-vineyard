import { Fragment, useContext, useEffect, useState } from "react"
import { GroupMembersSortAlternative, groupMembersSortAlternatives } from "../../helpers/sorting"
import { Popover, Transition } from "@headlessui/react"
import { useGroupLeaderboard, useMyGroups } from "../../helpers/api"
import { useNavigate, useParams } from "react-router-dom"

import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { GivePunishmentModalProvider } from "../../helpers/givePunishmentModalContext"
import { Group } from "../../helpers/types"
import { GroupsSidebar } from "./sidebar/GroupsSidebar"
import { Table } from "../../components/table"
import { Tabs } from "./tabs/Tabs"
import { ToggleOption } from "../../components/toggle/MultipleToggle"
import { TogglePunishmentsProvider } from "../../helpers/togglePunishmentsContext"
import { UserContext } from "../../helpers/userContext"

export const GroupsView = () => {
  const { setUserContext } = useContext(UserContext)
  const navigate = useNavigate()

  const params = useParams<{ groupName?: string }>()
  const selectedGroupName = params.groupName

  const [searchTerm, setSearchTerm] = useState("")
  const [toggledPunishmentTypesOptions, setToggledPunishmentTypesOptions] = useState<ToggleOption<string>[]>([])
  const [sortingAlternative, setSortingAlternative] = useState<GroupMembersSortAlternative>(
    groupMembersSortAlternatives[0]
  )

  const { data: user } = useMyGroups()

  useEffect(() => {
    if (user) setUserContext({ user_id: user.user_id })
    if (user && selectedGroupName === undefined) {
      navigate(`/komiteer/${user.groups[0].name_short.toLowerCase()}`)
    }
  }, [user, selectedGroupName])

  const selectedGroup = user?.groups.find(
    (group) => group.name_short.toLowerCase() === selectedGroupName?.toLowerCase()
  )

  const { isLoading, data, refetch } = useGroupLeaderboard(selectedGroup?.group_id, (group) => {
    setToggledPunishmentTypesOptions(
      group.punishment_types.map((punishmentType) => ({
        text: punishmentType.name,
        value: punishmentType.punishment_type_id.toString(),
        checked: true,
      }))
    )
  })

  const sidebarElement = (
    <GroupsSidebar
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      toggledPunishmentTypesOptions={toggledPunishmentTypesOptions}
      setToggledPunishmentTypesOptions={setToggledPunishmentTypesOptions}
      sortingAlternative={sortingAlternative}
      setSortingAlternative={setSortingAlternative}
      groupDataIsLoading={isLoading}
      groupData={selectedGroup}
    />
  )

  return (
    <GivePunishmentModalProvider>
      <TogglePunishmentsProvider>
        <section className="grid gap-x-6 md:grid-cols-[20rem_minmax(26rem,_1fr)] max-w-screen-xl w-[90%] mx-auto">
          <div className="md:mt-[6.5rem] hidden md:block">{sidebarElement}</div>
          <div className="mt-8 md:mt-16 w-full mx-auto md:mx-0">
            <div className="flex flex-row justify-between items-end w-full">
              <Tabs
                selectedGroup={selectedGroup}
                setSelectedGroup={(group: Group) => group && navigate(`/komiteer/${group.name_short.toLowerCase()}`)}
                groups={user ? user.groups : undefined}
                dataRefetch={refetch}
              />
              <Popover className="relative mb-1 mr-2 block md:hidden">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={`
                  ${open ? "text-white" : "text-white/90"}
                  group z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                    >
                      <Cog6ToothIcon
                        className={`${open ? "text-gray-900" : "text-gray-900/70"}
                    h-6 w-6 transition duration-150 ease-in-out group-hover:text-gray-900/80`}
                        aria-hidden="true"
                      />
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute z-10 mt-3 -right-10 shadow-2xl rounded-xl w-screen max-w-sm transform sm:px-0 lg:max-w-3xl">
                        {sidebarElement}
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
            <Table
              groupData={data}
              isLoading={isLoading}
              dataRefetch={refetch}
              searchTerm={searchTerm}
              punishmentTypesToShow={Object.values(toggledPunishmentTypesOptions)
                .filter((option) => option.checked)
                .map((option) => option.value)}
              sortingAlternative={sortingAlternative}
            />
          </div>
        </section>
      </TogglePunishmentsProvider>
    </GivePunishmentModalProvider>
  )
}
