import { FC, ReactNode } from "react"

import { Menu } from "@headlessui/react"

interface PunishmentActionBarListItemProps {
  label: string
  icon?: ReactNode
  onClick?: () => void
}

export const PunishmentActionBarListItem: FC<PunishmentActionBarListItemProps> = ({ label, icon, onClick }) => {
  return (
    <Menu.Item
      as="div"
      className="py-4 w-72 flex flex-row gap-x-2 items-center px-4 hover:bg-slate-100 dark:hover:bg-slate-800  cursor-pointer text-black"
      onClick={onClick}
    >
      {icon}
      <span className="">{label}</span>
    </Menu.Item>
  )
}
