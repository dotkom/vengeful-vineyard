import { Menu, Switch, Transition } from "@headlessui/react"
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosResponse } from "axios"
import { Dispatch, Fragment, ReactNode, SetStateAction } from "react"
import { GroupPermissions, GroupUser } from "../../helpers/types"

import { VengefulApiError, getPostAllPunishmentsPaidForUserUrl, useGroupLeaderboard } from "../../helpers/api"
import { classNames } from "../../helpers/classNames"
import { useCurrentUser } from "../../helpers/context/currentUserContext"
import { useGivePunishmentModal } from "../../helpers/context/modal/givePunishmentModalContext"
import { useNotification } from "../../helpers/context/notificationContext"
import { useTogglePunishments } from "../../helpers/context/togglePunishmentsContext"
import { hasPermission } from "../../helpers/permissions"
import { PunishmentActionBarListItem } from "./PunishmentActionBarListItem"

interface PunishmentActionBarProps {
  user: GroupUser
  label?: string
}

interface ActionBarItem {
  label: string
  icon: ReactNode
  onClick?: () => void
}

export const PunishmentActionBar = ({ user, label }: PunishmentActionBarProps) => {
  let setOpen: Dispatch<SetStateAction<boolean>>
  let setPreferredSelectedPerson: Dispatch<SetStateAction<GroupUser | undefined>>
  let isToggled: boolean | undefined
  let setIsToggled: Dispatch<SetStateAction<boolean>> | undefined

  const { setNotification } = useNotification()
  const queryClient = useQueryClient()
  const { currentUser } = useCurrentUser()

  const { data: groupData } = useGroupLeaderboard((user as GroupUser).group_id, undefined, {})

  let groupPermissions: GroupPermissions = {}

  const { setOpen: newSetOpen, setPreferredSelectedPerson: newSetPreferredSelectedPerson } = useGivePunishmentModal()
  setOpen = newSetOpen
  setPreferredSelectedPerson = newSetPreferredSelectedPerson

  const { isToggled: newIsToggled, setIsToggled: newSetIsToggled } = useTogglePunishments()
  isToggled = newIsToggled
  setIsToggled = newSetIsToggled

  if (groupData) {
    groupPermissions = groupData.permissions
  }

  const markAllPunishmentsAsPaidCall = async () => {
    const groupUser = user as GroupUser

    const POST_ALL_PUNISHMENTS_PAID_URL = getPostAllPunishmentsPaidForUserUrl(groupUser.group_id, user.user_id)
    const res: AxiosResponse<string> = await axios.post(POST_ALL_PUNISHMENTS_PAID_URL)

    return res.data
  }

  const { mutate: mutateMarkAllPunishmentsAsPaid } = useMutation(markAllPunishmentsAsPaidCall, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupLeaderboard"] })
      setNotification({
        show: true,
        type: "success",
        title: "Betalinger registert",
        text: `Alle straffer registrert som betalte`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere betalingene",
        text: e.response.data.detail,
      })
    },
  })

  const listItems: ActionBarItem[] = []
  const currentGroupUser = groupData?.members.find((groupUser) => groupUser.user_id === currentUser?.user_id)
  if (currentGroupUser) {
    const isOwGroup = currentGroupUser.ow_group_user_id !== null
    const role = currentGroupUser.permissions.at(0) ?? ""

    /*
    if (isOwGroup || hasPermission(groupPermissions, "group.punishments.add", role)) {
     */
    listItems.push({
      label: "Gi straff",
      icon: <PlusIcon className="h-5 w-5 text-black" />,
      onClick: () => {
        setOpen(true)
        setPreferredSelectedPerson(user as GroupUser)
      },
    })

    if (hasPermission(groupPermissions, "group.punishments.mark_paid", role)) {
      listItems.push({
        label: "Marker alle straffer som betalte",
        icon: <PlusIcon className="h-5 w-5 text-black" />,
        onClick: () => {
          mutateMarkAllPunishmentsAsPaid()
        },
      })
    }
  }

  return (
    <div
      className={classNames(
        `w-full h-16 border-t flex flex-row items-center px-4 justify-between dark:border-gray-700`,
        !label && listItems.length === 0 ? "hidden" : ""
      )}
    >
      {setIsToggled ? (
        <div className="flex flex-row gap-x-2 items-center">
          <Switch
            checked={isToggled}
            onChange={setIsToggled}
            className={`${
              isToggled ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">Toggle shown punishments</span>
            <span
              className={`${
                isToggled ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
          <span className="text-xs md:text-sm text-slate-600">Vis betalte straffer</span>
        </div>
      ) : (
        <span></span>
      )}
      {label && <p className="text-sm text-slate-600">{label}</p>}
      {listItems.length > 0 ? (
        <Menu as="div" className="relative">
          <div>
            <Menu.Button className="flex rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="sr-only">Open user menu</span>
              <EllipsisHorizontalIcon className="h-10 w-10 text-slate-600" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none !overflow-visible">
              {listItems.map((item, i) => (
                <PunishmentActionBarListItem key={i} label={item.label} icon={item.icon} onClick={item.onClick} />
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      ) : (
        <span></span>
      )}
    </div>
  )
}
