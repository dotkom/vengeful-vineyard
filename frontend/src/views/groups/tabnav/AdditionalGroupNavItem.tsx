import { MagnifyingGlassIcon, PlusCircleIcon } from "@heroicons/react/24/outline"

import { Menu } from "../../../components/menu/Menu"
import { MenuItemProps } from "../../../components/menu/MenuItem"
import { PlusIcon } from "@radix-ui/react-icons"
import { useCreateGroupModal } from "../../../helpers/context/modal/createGroupModalContext"
import { useRequestToJoinGroupModal } from "../../../helpers/context/modal/requestToJoinGroupModalContext"

export const AdditionalGroupNavItem = () => {
  const { setOpen: setCreateGroupModalOpen } = useCreateGroupModal()
  const { setOpen: setRequestToJoinGroupModal } = useRequestToJoinGroupModal()

  const listItems: MenuItemProps[] = [
    {
      label: "Lag ny gruppe",
      icon: <PlusCircleIcon className="h-5 w-5" />,
      color: "REGULAR",
      onClick: () => {
        setCreateGroupModalOpen(true)
      },
    },
    {
      label: "Finn gruppe",
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      color: "REGULAR",
      onClick: () => {
        setRequestToJoinGroupModal(true)
      },
    },
  ]

  return (
    <div className="-ml-2 -mt-2">
      <Menu
        icon={
          <span className="text-gray-900/70 dark:text-gray-300/70 hover:opacity-90">
            <PlusIcon className="h-6 w-6" />
          </span>
        }
        items={listItems}
      />
    </div>
  )
}
