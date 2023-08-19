import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { classNames } from "../../helpers/classNames";
import { Group } from "../../helpers/types";

interface TabItemProps {
  group: Group;
  selectedGroup: Group | undefined;
}

export const TabItem = ({ group, selectedGroup }: TabItemProps) => (
  <a
    className={classNames(
      group.group_id === selectedGroup?.group_id
        ? "border-black text-gray-900"
        : "border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-900",
      "group inline-flex cursor-pointer items-center border-b-4 px-1 py-2 text-sm font-medium"
    )}
    aria-current={group.group_id ? "page" : undefined}
  >
    <ComputerDesktopIcon
      className={classNames(
        group.group_id === selectedGroup?.group_id
          ? "text-gray-900"
          : "text-gray-500 group-hover:text-gray-900",
        "-ml-0.5 mr-2 h-5 w-5"
      )}
      aria-hidden="true"
    />
    <span>{group.name_short}</span>
  </a>
);
