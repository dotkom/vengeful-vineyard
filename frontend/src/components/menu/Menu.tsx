import { FC, Fragment, ReactNode } from "react"
import { Menu as HeadlessUiMenu, Transition } from "@headlessui/react"
import { MenuItem, MenuItemProps } from "./MenuItem"

interface MenuProps {
  icon?: ReactNode
  items: MenuItemProps[]
}

export const Menu: FC<MenuProps> = ({ icon, items }) => {
  return (
    <HeadlessUiMenu as="div" className="relative">
      <div>
        <HeadlessUiMenu.Button className="flex rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2">
          {icon}
        </HeadlessUiMenu.Button>
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
        <HeadlessUiMenu.Items className="absolute right-0 z-10 mt-2 w-fit origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none !overflow-visible">
          {items.map((item, i) => (
            <MenuItem key={i} {...item} />
          ))}
        </HeadlessUiMenu.Items>
      </Transition>
    </HeadlessUiMenu>
  )
}
