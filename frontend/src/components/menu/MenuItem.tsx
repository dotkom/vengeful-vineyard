import { FC, ReactNode } from "react"

import { Menu } from "@headlessui/react"

export interface MenuItemProps {
  label: string
  icon?: ReactNode
  color?: "REGULAR" | "RED"
  onClick?: () => void
}

export const MenuItem: FC<MenuItemProps> = ({ label, icon, color = "REGULAR", onClick }) => {
  let colorClass = ""
  switch (color) {
    case "REGULAR":
      colorClass = "text-gray-800"
      break
    case "RED":
      colorClass = "text-red-600"
      break
  }

  return (
    <Menu.Item
      as="div"
      className={`py-4 flex flex-row gap-x-2 items-center px-4 cursor-pointer hover:bg-slate-600/5 ${colorClass}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs md:text-sm -mb-px whitespace-nowrap">{label}</span>
    </Menu.Item>
  )
}
