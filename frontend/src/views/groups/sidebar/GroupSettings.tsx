import {
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import { deleteGroupMemberMutation, deleteGroupMutation } from "../../../helpers/api"

import { useMutation } from "@tanstack/react-query"
import { FC } from "react"
import { Menu } from "../../../components/menu/Menu"
import { MenuItemProps } from "../../../components/menu/MenuItem"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import { useConfirmModal } from "../../../helpers/context/modal/confirmModalContext"
import { useEditGroupMembersModal } from "../../../helpers/context/modal/editGroupMembersModalContext"
import { useEditGroupModal } from "../../../helpers/context/modal/editGroupModalContext"
import { Group } from "../../../helpers/types"
import { usePermission } from "../../../helpers/permissions"

interface GroupSettingsProps {
  groupData: Group | undefined
}

export const GroupSettings: FC<GroupSettingsProps> = ({ groupData }) => {
  const { setOpen: setEditGroupModalOpen } = useEditGroupModal()
  const { setOpen: setEditGroupMembersModalOpen } = useEditGroupMembersModal()
  const { currentUser } = useCurrentUser()
  const {
    setOpen: setConfirmModalOpen,
    setType: setConfirmModalType,
    setOptions: setConfirmModalOptions,
  } = useConfirmModal()

  const { mutate: leaveGroupMutate } = useMutation(deleteGroupMemberMutation(groupData?.group_id, currentUser.user_id))

  const { mutate: deleteGroupMutate } = useMutation(deleteGroupMutation(groupData?.group_id))

  const listItems: MenuItemProps[] = []

  if (usePermission("group.members.manage", groupData)) {
    listItems.unshift({
      label: "Rediger medlemmer",
      icon: <UserGroupIcon className="h-5 w-5" />,
      onClick: () => {
        setEditGroupMembersModalOpen(true)
      },
    })
  }

  if (usePermission("group.edit", groupData)) {
    listItems.unshift({
      label: "Rediger gruppe",
      icon: <PencilSquareIcon className="h-5 w-5" />,
      onClick: () => {
        setEditGroupModalOpen(true)
      },
    })
  }

  if (groupData?.ow_group_id === null) {
    listItems.push({
      label: "Forlat gruppe",
      icon: <ArrowLeftOnRectangleIcon className="h-5 w-5" />,
      color: "RED",
      onClick: () => {
        setConfirmModalType("YESNO")
        setConfirmModalOptions({
          onClose: (retVal) => {
            if (retVal) leaveGroupMutate()
          },
          primaryButtonLabel: "Forlat",
          cancelButtonLabel: "Avbryt",
        })
        setConfirmModalOpen(true)
      },
    })

    if (usePermission("group.delete", groupData)) {
      listItems.push({
        label: "Slett gruppe",
        icon: <TrashIcon className="h-5 w-5" />,
        color: "RED",
        onClick: () => {
          setConfirmModalType("INPUT")
          setConfirmModalOptions({
            onClose: (retVal) => {
              if (retVal) deleteGroupMutate()
            },
            primaryButtonLabel: "Slett",
            cancelButtonLabel: "Avbryt",
            inputKeyword: groupData.name_short,
          })
          setConfirmModalOpen(true)
        },
      })
    }
  }

  if (listItems.length === 0) return null

  return (
    <Menu
      icon={
        <span className="text-gray-700">
          <Cog6ToothIcon className="h-[1.6rem] w-[1.6rem]" />
        </span>
      }
      items={listItems}
    />
  )
}
