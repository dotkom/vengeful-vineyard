import { ComputerDesktopIcon, UserGroupIcon } from "@heroicons/react/24/outline"

import { Group } from "../../../helpers/types"
import { classNames } from "../../../helpers/classNames"
import NoImage from "../../../assets/NoImage.png"
import React from "react"

interface TabNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  group: Group
  selectedGroup: Group | undefined
}

function getGroupIcon(image: string) {
  function GroupIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={image === "NoImage" ? (NoImage as string) : image} alt="" {...props} />
  }
  return GroupIcon
}

export const TabNavItem = ({ group, selectedGroup, ...props }: TabNavItemProps) => {
  const GroupIcon = group.image !== "NoImage" && group.image ? getGroupIcon(group.image) : UserGroupIcon

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
      <div className="-mt-1 h-6 w-6 md:h-7 md:w-7">
        <GroupIcon
          className={classNames(
            group.name_short === selectedGroup?.name_short
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-100",
            group.image !== "NoImage" && group.image ? "grayscale dark:invert" : ""
          )}
          aria-hidden="true"
        />
      </div>
      <span className="whitespace-nowrap">{group.name_short}</span>
    </a>
  )
}
