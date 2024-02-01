import { ComputerDesktopIcon, UserGroupIcon } from "@heroicons/react/24/outline"

import { Group } from "../../../helpers/types"
import { classNames } from "../../../helpers/classNames"

interface TabNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  group: Group
  selectedGroup: Group | undefined
}

export const TabNavItem = ({ group, selectedGroup, ...props }: TabNavItemProps) => {
  const GroupIcon = group.ow_group_id !== null ? ComputerDesktopIcon : UserGroupIcon

  return (
    <a
      className={classNames(
        group.name_short === selectedGroup?.name_short
          ? "border-black dark:border-white text-gray-900 dark:text-gray-100"
          : "border-transparent text-gray-500 dark:text-gray-500 hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100",
        "group flex flex-row gap-x-1 cursor-pointer items-center border-b-4 px-1 py-2 text-xs md:text-sm font-medium"
      )}
      aria-current={group.group_id ? "page" : undefined}
      {...props}
    >
      <GroupIcon
        className={classNames(
          group.name_short === selectedGroup?.name_short
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100",
          "-mt-1 h-4 w-4 md:h-5 md:w-5"
        )}
        aria-hidden="true"
      />
      <span>{group.name_short}</span>
    </a>
  )
}
