import { FC, ReactNode } from "react"

import { Menu } from "@headlessui/react"

export interface MenuItemProps {
  label: string
  icon?: ReactNode
  onClick?: () => void
}

export const MenuItem: FC<MenuItemProps> = ({ label, icon, onClick }) => {
  return (
    <Menu.Item
      as="div"
      className="py-4 flex flex-row gap-x-2 items-center px-4 hover:bg-slate-100 cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span className="text-gray-700 text-sm -mb-px whitespace-nowrap">{label}</span>
    </Menu.Item>
  )
}
