import { Popover, Transition } from "@headlessui/react"
import React, { Fragment, useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  groupLeaderboardQuery,
  postGroupJoinRequestMutation,
  publicGroupQuery,
  userQuery,
  postJoinGroupMutation,
} from "../../helpers/api"
import { GroupMembersSortAlternative, groupMembersSortAlternatives } from "../../helpers/sorting"

// TODO: Remove some stuff for ow groups
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { useAuth } from "react-oidc-context"
import { Button } from "../../components/button"
import { Spinner } from "../../components/spinner"
import { ToggleOption } from "../../components/toggle/MultipleToggle"
import { useCurrentUser } from "../../helpers/context/currentUserContext"
import { useAdministerGroupJoinRequestsModal } from "../../helpers/context/modal/administerGroupJoinRequestsModalContext"
import { useCreateGroupModal } from "../../helpers/context/modal/createGroupModalContext"
import { useEditGroupMembersModal } from "../../helpers/context/modal/editGroupMembersModalContext"
import { useEditGroupModal } from "../../helpers/context/modal/editGroupModalContext"
import { useRequestToJoinGroupModal } from "../../helpers/context/modal/requestToJoinGroupModalContext"
import { useMyGroupsRefetch } from "../../helpers/context/myGroupsRefetchContext"
import { Group } from "../../helpers/types"
import { LandingPage } from "../hero"
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
import { GroupUserTable } from "../../components/groupusertable"
import { useMutation, useQuery } from "@tanstack/react-query"
import { signinAndReturn } from "../../helpers/auth"

export const GroupView = () => {
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
  const auth = useAuth()
  const location = useLocation()

  const params = useParams<{ groupName?: string; inviteCode?: string }>()
  const selectedGroupName = params.groupName
  const inviteCode = params.inviteCode

  const [searchTerm, setSearchTerm] = useState("")
  const [toggledPunishmentTypesOptions, setToggledPunishmentTypesOptions] = useState<ToggleOption<string>[]>([])
  const [sortingAlternative, setSortingAlternative] = useState<GroupMembersSortAlternative>(
    groupMembersSortAlternatives[1]
  )

  const { data: user, refetch: myGroupsRefetch, isLoading: userIsLoading } = useQuery(userQuery())

  useEffect(() => {
    setMyGroupsRefetch(() => myGroupsRefetch as any)
  }, [myGroupsRefetch])

  useEffect(() => {
    if (!user) return

    setCurrentUser({ user_id: user.user_id })

    if (selectedGroupName === undefined && user.groups.length > 0) {
      navigate(`/gruppe/${user.groups[0].name_short.toLowerCase()}`)
    }

    if (selectedGroupName !== undefined) {
      const targetGroup = user.groups.find(
        (group) => group.name_short.toLowerCase() === selectedGroupName.toLowerCase()
      )

      if (targetGroup) {
        setSelectedGroup(targetGroup)
      }
    }
  }, [user, selectedGroupName])

  const selectedGroup = user?.groups.find(
    (group) => group.name_short.toLowerCase() === selectedGroupName?.toLowerCase()
  )

  useEffect(() => {
    if (selectedGroup && inviteCode) {
      navigate(`/gruppe/${selectedGroup.name_short.toLowerCase()}`)
    }
  })

  const { isLoading, data, refetch } = useQuery({
    ...groupLeaderboardQuery(selectedGroup?.group_id),
    onSuccess: (group) => {
      setToggledPunishmentTypesOptions(
        Object.entries(group.punishment_types)
          .map(([punishmentTypeId, punishmentType]) => ({
            text: punishmentType.name,
            value: punishmentTypeId.toString(),
            checked: true,
          }))
          .sort((a, b) => b.text.localeCompare(a.text))
      )
    },
  })

  const { data: publicGroup } = useQuery({
    ...publicGroupQuery(selectedGroupName?.toLowerCase()),
    enabled: !!currentUser && !userIsLoading && !selectedGroup,
  })

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

  const { mutate: requestToJoinGroupMutate } = useMutation(postGroupJoinRequestMutation(publicGroup?.group_id))

  const shouldShowMain = user && selectedGroup

  const {
    mutate: joinGroupMutate,
    isSuccess: joinGroupSuccess,
    isError: joinGroupError,
  } = useMutation(postJoinGroupMutation(publicGroup?.group_id, inviteCode, publicGroup?.name_short))

  const inviteCodeIsCorrect = !selectedGroup && inviteCode && publicGroup?.invite_code === inviteCode && !joinGroupError

  useEffect(() => {
    if (inviteCodeIsCorrect) {
      joinGroupMutate()
    }
  }, [inviteCodeIsCorrect])

  useEffect(() => {
    if (joinGroupSuccess) {
      myGroupsRefetch()
    }
  }, [joinGroupSuccess])

  const inviteCodeIsWrong = joinGroupError || inviteCodeIsCorrect === false

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
      {currentUser && !userIsLoading && !selectedGroup && !selectedGroupName && <LandingPage />}
      {currentUser && !userIsLoading && !selectedGroup && selectedGroupName && !inviteCodeIsCorrect && (
        <section className="flex flex-col gap-y-6 items-center w-full text-gray-800 mt-16">
          {publicGroup && (
            <div className="flex flex-col gap-y-4 items-center text-center">
              <h1 className="text-4xl font-bold">
                {publicGroup.is_official
                  ? `${publicGroup.name_short}`
                  : inviteCodeIsWrong
                  ? `Ugyldig kode`
                  : `Bli medlem av ${publicGroup.name_short}!`}
              </h1>
              {publicGroup.image && <img className="w-60" src={publicGroup.image} alt={publicGroup.name} />}
              <h3>
                {publicGroup.is_official ? (
                  <>
                    Du er ikke registrert som medlem av {publicGroup.name_short}.<br />
                    Logget inn som {user?.first_name} {user?.last_name}
                    <br />
                    Ta kontakt med{" "}
                    <a className="font-bold underline" href="mailto:dotkom@online.ntnu.no">
                      Dotkom
                    </a>{" "}
                    om dette er feil.
                  </>
                ) : (
                  <>
                    {inviteCodeIsWrong ? (
                      <>
                        Du er ikke et medlem av gruppen {publicGroup.name_short}.<br />
                        Be om en ny kode eller trykk på knappen under for å bli medlem
                      </>
                    ) : (
                      <>
                        Du er ikke et medlem av gruppen {publicGroup.name_short}.<br />
                        Trykk på knappen under for å bli medlem
                      </>
                    )}
                  </>
                )}
              </h3>
              <div className="flex flex-row gap-x-4 items-center">
                {!publicGroup.is_official && (
                  <Button onClick={() => requestToJoinGroupMutate(publicGroup?.group_id)}>Send forespørsel</Button>
                )}
                <Button
                  onClick={async () => {
                    await auth.removeUser()
                    signinAndReturn(auth, location)
                  }}
                  variant="OUTLINE"
                >
                  Bytt konto
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
      {shouldShowMain && (
        <section className="md:grid gap-x-6 md:grid-cols-[20rem_minmax(26rem,_1fr)] max-w-screen-xl w-[90%] mx-auto">
          <div className="md:mt-[5.5rem] hidden md:block">{sidebarElement}</div>
          <div className="mt-8 md:mt-12 w-full mx-auto md:mx-0">
            <div className="flex flex-row justify-between items-end w-full mb-px">
              <TabNav
                selectedGroup={selectedGroup}
                setSelectedGroup={(group: Group) => group && navigate(`/gruppe/${group.name_short.toLowerCase()}`)}
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
                        className={`${
                          open ? "text-gray-900 dark:text-gray-300" : "text-gray-900/70 dark:text-gray-300/70"
                        }
                    h-5 w-5 md:h-6 md:w-6 transition duration-150 ease-in-out group-hover:text-gray-900/80 dark:group-hover:text-gray-300/80`}
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
            <GroupUserTable
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
