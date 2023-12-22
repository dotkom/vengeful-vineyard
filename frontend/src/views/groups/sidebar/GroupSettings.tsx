import { Cog6ToothIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline"
import { FC, useState } from "react"

import { EditGroupModal } from "./modal/EditGroupModal"
import { Menu } from "../../../components/menu/Menu"
import { MenuItemProps } from "../../../components/menu/MenuItem"

interface GroupSettingsProps {}

export const GroupSettings: FC<GroupSettingsProps> = () => {
  const [editGroupOpen, setEditGroupOpen] = useState<boolean>(false)

  // const editGroupCallback = (val: boolean) => {
  //   setEditGroupOpen(false)
  // }

  const listItems: MenuItemProps[] = [
    {
      label: "Rediger gruppe",
      icon: <PencilSquareIcon className="h-5 w-5" />,
      onClick: () => {
        setEditGroupOpen(true)
      },
    },
    {
      label: "Slett gruppe",
      icon: <TrashIcon className="h-5 w-5" />,
      onClick: () => {
        // mutateMarkAllPunishmentsAsPaid()
      },
    },
  ]

  return (
    <>
      <EditGroupModal open={editGroupOpen} setOpen={setEditGroupOpen} />
      <Menu
        icon={
          <span className="text-gray-700">
            <Cog6ToothIcon className="h-[1.6rem] w-[1.6rem]" />
          </span>
        }
        items={listItems}
      />
    </>
  )
}
