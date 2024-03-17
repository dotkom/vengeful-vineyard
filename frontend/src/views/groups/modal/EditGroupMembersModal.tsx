import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dispatch, FC, Fragment, SetStateAction, useEffect, useRef, useState } from "react"
import { Listbox, ListboxOption } from "../../../components/listbox/Listbox"
import {
  VengefulApiError,
  groupLeaderboardQuery,
  patchGroupMemberPermissionsMutation,
  transferGroupOwnershipMutation,
  deleteGroupMemberMutation,
} from "../../../helpers/api"
import { canGiveRole, usePermission } from "../../../helpers/permissions"

import { Transition } from "@headlessui/react"
import axios from "axios"
import { Button } from "../../../components/button"
import { PersonSelect } from "../../../components/input/PersonSelect"
import { Modal } from "../../../components/modal"
import { Spinner } from "../../../components/spinner"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useConfirmModal } from "../../../helpers/context/modal/confirmModalContext"
import { useNotification } from "../../../helpers/context/notificationContext"
import { GroupUser } from "../../../helpers/types"

interface EditGroupMembersModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const EditGroupMembersModal: FC<EditGroupMembersModalProps> = ({ open, setOpen }) => {
  const { selectedGroup } = useGroupNavigation()
  const { currentUser } = useCurrentUser()
  const ref = useRef(null)

  const {
    setOpen: setConfirmModalOpen,
    setType: setConfirmModalType,
    setOptions: setConfirmModalOptions,
  } = useConfirmModal()

  const [members, setMembers] = useState<GroupUser[]>([])

  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(undefined)
  const [currentRole, setCurrentRole] = useState<string>("")
  const [currentRolesOptions, setCurrentRolesOptions] = useState<ListboxOption<string>[]>([])

  const isCurrentUserSelected = selectedPerson?.user_id === currentUser.user_id
  const [currentUserRole, setCurrentUserRole] = useState<string>("")

  const { data: groupData } = useQuery({
    onSuccess: (group) => {
      const newMembers = [...group.members]
      newMembers.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`))
      setMembers(newMembers)

      const newSelectedPerson = newMembers.find((member) => member.user_id === selectedPerson?.user_id)
      setSelectedPerson(newSelectedPerson ? newSelectedPerson : newMembers[0])
    },
    ...groupLeaderboardQuery(selectedGroup?.group_id),
  })

  useEffect(() => {
    if (!selectedPerson) return

    const role = selectedPerson.permissions.at(0) ?? ""
    setCurrentRole(role)

    const newRolesOptions =
      groupData?.roles.map(([roleName, rolePermission]) => ({
        label: roleName,
        value: rolePermission,
        disabled: false,
      })) ?? []

    const groupRoles = groupData?.roles ?? []
    const groupPermissions = groupData?.permissions ?? {}
    const isCurrentUser = selectedPerson.user_id === currentUser.user_id

    newRolesOptions.forEach((option) => {
      const canGiveRoleCheck = canGiveRole(groupRoles, groupPermissions, option.value, currentUserRole)
      if (
        (isCurrentUser && (currentUserRole === "group.owner" || !canGiveRoleCheck)) ||
        (!isCurrentUser && !canGiveRoleCheck)
      ) {
        option.disabled = true
      } else {
        option.disabled = false
      }
    })
    setCurrentRolesOptions(newRolesOptions)
  }, [selectedPerson])

  useEffect(() => {
    setCurrentUserRole(
      groupData?.members.find((member) => member.user_id === currentUser.user_id)?.permissions.at(0) ?? ""
    )
  }, [currentUser, groupData])

  const { mutate: transferOwnershipMutate } = useMutation(
    transferGroupOwnershipMutation(selectedGroup?.group_id ?? "", selectedPerson?.user_id ?? "")
  )

  const { mutate: removeMemberMutate } = useMutation(
    deleteGroupMemberMutation(selectedGroup?.group_id ?? "", selectedPerson?.user_id ?? "")
  )

  const { mutate: changeRoleMutate } = useMutation(
    patchGroupMemberPermissionsMutation(selectedGroup?.group_id, selectedPerson?.user_id, currentRole)
  )

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Rediger gruppemedlemmer"
        description="Her kan du redigere gruppemedlemmer"
        setOpen={setOpen}
        includePrimaryButton={false}
        cancelButtonLabel="Lukk"
      >
        <div className="mb-4 md:mt-2 flex flex-col gap-6 font-normal">
          {!groupData ? (
            <Spinner />
          ) : (
            <>
              <div className="w-64"></div>

              <div className="flex flex-col gap-y-4">
                <PersonSelect
                  label="Rediger gruppemedlem"
                  members={members}
                  selectedPerson={selectedPerson}
                  setSelectedPerson={setSelectedPerson}
                />
                <div className="flex flex-col gap-y-3 w-full border-l-2 border-l-gray-500/50 pl-3">
                  <Listbox
                    label="Rolle"
                    options={currentRolesOptions}
                    value={currentRole}
                    onChange={(value) => setCurrentRole(value)}
                  />
                  <Button
                    variant="OUTLINE"
                    label="Endre rolle"
                    color="BLUE"
                    disabled={
                      !currentRolesOptions.find((option) => !option.disabled) ||
                      currentRole === (selectedPerson?.permissions.at(0) ?? "")
                    }
                    onClick={() => {
                      if (isCurrentUserSelected) {
                        setConfirmModalType("YESNO")
                        setConfirmModalOptions({
                          message:
                            "Dersom du bytter rolle på deg selv vil du ikke selv ville gjenopprette den gamle rollen din",
                          onClose: (retval) => {
                            if (retval) {
                              changeRoleMutate()
                            }
                          },
                        })
                        setConfirmModalOpen(true)
                      } else {
                        changeRoleMutate()
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col gap-y-3">
                  {usePermission("group.transfer_ownership", groupData) && (
                    <Button
                      variant="OUTLINE"
                      label="Overfør lederskap"
                      color="RED"
                      onClick={() => {
                        setConfirmModalType("INPUT")
                        setConfirmModalOptions({
                          primaryButtonLabel: "Overfør",
                          cancelButtonLabel: "Avbryt",
                          inputKeyword: "Overfør",
                          onClose: (retval) => {
                            if (retval) {
                              transferOwnershipMutate()
                            }
                          },
                        })
                        setConfirmModalOpen(true)
                      }}
                      disabled={isCurrentUserSelected}
                    />
                  )}

                  {usePermission("group.members.remove", groupData) && (
                    <Button
                      variant="OUTLINE"
                      label="Fjern fra gruppa"
                      color="RED"
                      onClick={() => {
                        setConfirmModalType("YESNO")
                        setConfirmModalOptions({
                          onClose: (retval) => {
                            if (retval) {
                              removeMemberMutate()
                            }
                          },
                        })
                        setConfirmModalOpen(true)
                      }}
                      disabled={isCurrentUserSelected}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </Transition.Root>
  )
}
