import { Dispatch, Fragment, ReactNode, SetStateAction } from "react"
import { EllipsisHorizontalIcon, PlusIcon } from "@heroicons/react/24/outline"
import { GroupUser, LeaderboardUser } from "../../../helpers/types"
import { Menu, Switch, Transition } from "@headlessui/react"

import { PunishmentActionBarListItem } from "./PunishmentActionBarListItem"
import { classNames } from "../../../helpers/classNames"
import { useGivePunishmentModal } from "../../../helpers/givePunishmentModalContext"
import { useTogglePunishments } from "../../../helpers/togglePunishmentsContext"

interface PunishmentActionBarProps {
  user: LeaderboardUser | GroupUser
  label?: string
  isGroupContext?: boolean
}

interface ActionBarItem {
  label: string
  icon: ReactNode
  onClick?: () => void
}

export const PunishmentActionBar = ({ user, label, isGroupContext = true }: PunishmentActionBarProps) => {
  let setOpen: Dispatch<SetStateAction<boolean>>
  let setPreferredSelectedPerson: Dispatch<SetStateAction<GroupUser | undefined>>
  let isToggled: boolean | undefined
  let setIsToggled: Dispatch<SetStateAction<boolean>> | undefined

  if (isGroupContext) {
    const { setOpen: newSetOpen, setPreferredSelectedPerson: newSetPreferredSelectedPerson } = useGivePunishmentModal()
    setOpen = newSetOpen
    setPreferredSelectedPerson = newSetPreferredSelectedPerson

    const { isToggled: newIsToggled, setIsToggled: newSetIsToggled } = useTogglePunishments()
    isToggled = newIsToggled
    setIsToggled = newSetIsToggled
  }

  const listItems: ActionBarItem[] = []
  if (isGroupContext) {
    listItems.push({
      label: "Give punishment",
      icon: <PlusIcon className="h-5 w-5" />,
      onClick: () => {
        setOpen(true)
        setPreferredSelectedPerson(user as GroupUser)
      },
    })
  }

  return (
    <div
      className={classNames(
        `w-full h-16 border-y flex flex-row items-center px-4 justify-between`,
        !isGroupContext && !label && listItems.length === 0 ? "hidden" : ""
      )}
    >
      {isGroupContext && setIsToggled ? (
        <div className="flex flex-row gap-x-2 items-end">
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
          <span className="text-sm text-slate-600">
            {isToggled ? "Viser betalte straffer" : "Viser ubetalte straffer"}
          </span>
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
              <EllipsisHorizontalIcon className="h-10 w-10" color="#555555" />
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none !overflow-visible">
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
