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
      className="h-12 w-48 flex flex-row gap-x-2 items-center px-4 hover:bg-slate-100 cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span className="">{label}</span>
    </Menu.Item>
  )
}
