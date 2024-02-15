import {
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline"
import {
  VengefulApiError,
  getDeleteGroupMemberUrl,
  getDeleteGroupUrl,
  useGroupLeaderboard,
  useMyGroups,
} from "../../../helpers/api"

import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { FC } from "react"
import { Menu } from "../../../components/menu/Menu"
import { MenuItemProps } from "../../../components/menu/MenuItem"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useConfirmModal } from "../../../helpers/context/modal/confirmModalContext"
import { useEditGroupMembersModal } from "../../../helpers/context/modal/editGroupMembersModalContext"
import { useEditGroupModal } from "../../../helpers/context/modal/editGroupModalContext"
import { useMyGroupsRefetch } from "../../../helpers/context/myGroupsRefetchContext"
import { useNotification } from "../../../helpers/context/notificationContext"
import { hasPermission } from "../../../helpers/permissions"
import { Group } from "../../../helpers/types"
import { useNavigate } from "react-router-dom"

interface GroupSettingsProps {
  groupData: Group | undefined
}

export const GroupSettings: FC<GroupSettingsProps> = ({ groupData }) => {
  const { setOpen: setEditGroupModalOpen } = useEditGroupModal()
  const { setOpen: setEditGroupMembersModalOpen } = useEditGroupMembersModal()
  const { currentUser } = useCurrentUser()
  const { setNotification } = useNotification()
  const { myGroupsRefetch } = useMyGroupsRefetch()
  const { data: myGroups } = useMyGroups()
  const {
    setOpen: setConfirmModalOpen,
    setType: setConfirmModalType,
    setOptions: setConfirmModalOptions,
  } = useConfirmModal()

  if (!groupData) return null

  const { data: group } = useGroupLeaderboard(groupData.group_id, undefined, {
    enabled: !!groupData,
  })

  const currentUserRole = group?.members.find((member) => member.user_id === currentUser.user_id)?.permissions[0] ?? ""
  const groupPermissions = group?.permissions ?? {}
  const navigate = useNavigate()

  const { mutate: leaveGroupMutate } = useMutation(
    async () => await axios.delete(getDeleteGroupMemberUrl(groupData.group_id, currentUser.user_id)),
    {
      onSuccess: async () => {
        if (myGroupsRefetch) await myGroupsRefetch()
        setNotification({
          type: "success",
          text: "Gruppen ble forlatt",
        })
        navigate("/")
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke forlate gruppen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: deleteGroupMutate } = useMutation(
    async () => await axios.delete(getDeleteGroupUrl(groupData.group_id)),
    {
      onSuccess: async () => {
        if (myGroupsRefetch) await myGroupsRefetch()
        setNotification({
          type: "success",
          text: "Gruppen ble slettet",
        })
        navigate("/")
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke slette gruppen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const listItems: MenuItemProps[] = []

  if (hasPermission(groupPermissions, "group.members.manage", currentUserRole)) {
    listItems.unshift({
      label: "Rediger medlemmer",
      icon: <UserGroupIcon className="h-5 w-5" />,
      onClick: () => {
        setEditGroupMembersModalOpen(true)
      },
    })
  }

  if (hasPermission(groupPermissions, "group.edit", currentUserRole)) {
    listItems.unshift({
      label: "Rediger gruppe",
      icon: <PencilSquareIcon className="h-5 w-5" />,
      onClick: () => {
        setEditGroupModalOpen(true)
      },
    })
  }

  if (groupData.ow_group_id === null) {
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

    if (hasPermission(groupPermissions, "group.delete", currentUserRole)) {
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
