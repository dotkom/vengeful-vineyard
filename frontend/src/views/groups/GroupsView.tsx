import { Popover, Transition } from "@headlessui/react"
import { Fragment, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useGroupLeaderboard, useMyGroups } from "../../helpers/api"
import { GroupMembersSortAlternative, groupMembersSortAlternatives } from "../../helpers/sorting"

// TODO: Remove some stuff for ow groups
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { useAuth } from "react-oidc-context"
import { Button } from "../../components/button"
import { Spinner } from "../../components/spinner"
import { Table } from "../../components/table"
import { ToggleOption } from "../../components/toggle/MultipleToggle"
import { useCurrentUser } from "../../helpers/context/currentUserContext"
import { useAdministerGroupJoinRequestsModal } from "../../helpers/context/modal/administerGroupJoinRequestsModalContext"
import { useCreateGroupModal } from "../../helpers/context/modal/createGroupModalContext"
import { useEditGroupMembersModal } from "../../helpers/context/modal/editGroupMembersModalContext"
import { useEditGroupModal } from "../../helpers/context/modal/editGroupModalContext"
import { useRequestToJoinGroupModal } from "../../helpers/context/modal/requestToJoinGroupModalContext"
import { useMyGroupsRefetch } from "../../helpers/context/myGroupsRefetchContext"
import { Group } from "../../helpers/types"
import { DefaultHero } from "../hero"
import { AdministerGroupJoinRequestsModal } from "./modal/AdministerGroupJoinRequestsModal"
import { CreateGroupModal } from "./modal/CreateGroupModal"
import { EditGroupMembersModal } from "./modal/EditGroupMembersModal"
import { EditGroupModal } from "./modal/EditGroupModal"
import { RequestToJoinGroupModal } from "./modal/RequestToJoinGroupModal"
import { GroupsSidebar } from "./sidebar/GroupsSidebar"
import { TabNav } from "./tabnav/TabNav"
import { useGroupNavigation } from "../../helpers/context/groupNavigationContext"
import { GivePunishmentModal } from "./modal/GivePunishmentModal"
import { useGivePunishmentModal } from "../../helpers/context/modal/givePunishmentModalContext"

export const GroupsView = () => {
  const { currentUser, setCurrentUser } = useCurrentUser()
  const { setSelectedGroup } = useGroupNavigation()
  const { open: givePunishmentModalOpen, setOpen: setGivePunishmentModalOpen } = useGivePunishmentModal()
  const { open: createGroupModalOpen, setOpen: setCreateGroupModalOpen } = useCreateGroupModal()
  const { open: requestToJoinGroupModalOpen, setOpen: setRequestToJoinGroupModalOpen } = useRequestToJoinGroupModal()
  const { open: editGroupModalOpen, setOpen: setEditGroupModalOpen } = useEditGroupModal()
  const { open: editGroupMembersModalOpen, setOpen: setEditGroupMembersModalOpen } = useEditGroupMembersModal()
  const { open: administerGroupJoinRequestsModalOpen, setOpen: setAdministerGroupJoinRequestsModalOpen } =
    useAdministerGroupJoinRequestsModal()
  const navigate = useNavigate()
  const { setMyGroupsRefetch } = useMyGroupsRefetch()
  const { preferredGroupShortName, setPreferredGroupShortName } = useGroupNavigation()
  const auth = useAuth()

  const params = useParams<{ groupName?: string }>()
  const selectedGroupName = params.groupName

  const [searchTerm, setSearchTerm] = useState("")
  const [toggledPunishmentTypesOptions, setToggledPunishmentTypesOptions] = useState<ToggleOption<string>[]>([])
  const [sortingAlternative, setSortingAlternative] = useState<GroupMembersSortAlternative>(
    groupMembersSortAlternatives[0]
  )

  const { data: user, refetch: myGroupsRefetch, isLoading: userIsLoading } = useMyGroups()

  useEffect(() => {
    setMyGroupsRefetch(() => myGroupsRefetch)
  }, [myGroupsRefetch])

  useEffect(() => {
    if (user) setCurrentUser({ user_id: user.user_id })

    if (user && (selectedGroupName === undefined || preferredGroupShortName !== undefined) && user.groups.length > 0) {
      let targetGroup: Group | undefined = undefined

      if (preferredGroupShortName) {
        const preferredGroup = user.groups.find(
          (group) => group.name_short.toLowerCase() === preferredGroupShortName.toLowerCase()
        )
        if (preferredGroup) {
          targetGroup = preferredGroup
          setPreferredGroupShortName(undefined)
        }
      }

      if (!targetGroup) {
        targetGroup = user.groups[0]
      }

      navigate(`/komiteer/${targetGroup.name_short.toLowerCase()}`)
    }
  }, [user, selectedGroupName])

  const selectedGroup = user?.groups.find(
    (group) => group.name_short.toLowerCase() === selectedGroupName?.toLowerCase()
  )

  const { isLoading, data, refetch } = useGroupLeaderboard(
    selectedGroup?.group_id,
    (group) => {
      setToggledPunishmentTypesOptions(
        group.punishment_types.map((punishmentType) => ({
          text: punishmentType.name,
          value: punishmentType.punishment_type_id.toString(),
          checked: true,
        }))
      )
    },
    {
      enabled: selectedGroup !== undefined,
    }
  )

  useEffect(() => {
    setSelectedGroup(selectedGroup)
  }, [selectedGroup])

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

  const shouldShowMain = user && (user.groups.length ?? 0) > 0 && selectedGroup

  return (
    <>
      <GivePunishmentModal open={givePunishmentModalOpen} setOpen={setGivePunishmentModalOpen} />
      <CreateGroupModal open={createGroupModalOpen} setOpen={setCreateGroupModalOpen} />
      <RequestToJoinGroupModal open={requestToJoinGroupModalOpen} setOpen={setRequestToJoinGroupModalOpen} />
      <EditGroupModal open={editGroupModalOpen} setOpen={setEditGroupModalOpen} />
      <EditGroupMembersModal open={editGroupMembersModalOpen} setOpen={setEditGroupMembersModalOpen} />
      <AdministerGroupJoinRequestsModal
        open={administerGroupJoinRequestsModalOpen}
        setOpen={setAdministerGroupJoinRequestsModalOpen}
      />
      {userIsLoading && !selectedGroup && (
        <section className="w-full mt-16 flex items-center justify-center">
          <Spinner />
        </section>
      )}
      {currentUser && !userIsLoading && !selectedGroup && (user?.groups.length ?? 0) === 0 && (
        <DefaultHero
          auth={auth}
          setCreateGroupModalOpen={setCreateGroupModalOpen}
          setRequestToJoinGroupModalOpen={setRequestToJoinGroupModalOpen}
        />
      )}
      {currentUser && !userIsLoading && !selectedGroup && (user?.groups.length ?? 0) > 0 && (
        <section className="flex flex-col gap-y-6 items-center w-full text-gray-800 mt-16">
          <p>Ojsann. Denne gruppen ble ikke funnet.</p>
          <Button label="Refresh" variant="OUTLINE" onClick={() => navigate("/")} />
        </section>
      )}
      {shouldShowMain && (
        <section className="md:grid gap-x-6 md:grid-cols-[20rem_minmax(26rem,_1fr)] max-w-screen-xl w-[90%] mx-auto">
          <div className="md:mt-[5.5rem] md:block">{sidebarElement}</div>
          <div className="mt-8 md:mt-12 w-full mx-auto md:mx-0">
            <div className="flex flex-row justify-between items-end w-full mb-px">
              <TabNav
                selectedGroup={selectedGroup}
                setSelectedGroup={(group: Group) => group && navigate(`/komiteer/${group.name_short.toLowerCase()}`)}
                groups={user ? user.groups : undefined}
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
                    h-5 w-5 md:h-6 md:w-6 transition duration-150 ease-in-out group-hover:text-gray-900/80`}
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
      )}
    </>
  )
}
