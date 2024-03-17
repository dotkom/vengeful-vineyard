import { UserPlusIcon } from "@heroicons/react/24/outline"
import { FC } from "react"
import { useAdministerGroupJoinRequestsModal } from "../../../helpers/context/modal/administerGroupJoinRequestsModalContext"
import { usePermission } from "../../../helpers/permissions"
import { Group } from "../../../helpers/types"
import { groupLeaderboardQuery } from "../../../helpers/api"
import { useQuery } from "@tanstack/react-query"

interface GroupJoinRequestsContainerProps {
  groupData: Group | undefined
}

export const GroupJoinRequestsContainer: FC<GroupJoinRequestsContainerProps> = ({ groupData }) => {
  const { setOpen } = useAdministerGroupJoinRequestsModal()

  const { data: group } = useQuery(groupLeaderboardQuery(groupData?.group_id))

  const canViewJoinRequests = usePermission("group.join_requests.view", groupData)

  return (
    <>
      {groupData?.ow_group_id === null && canViewJoinRequests && (
        <button
          className="text-gray-700 relative bg-white rounded-md outline-none focus:ring-1 focus:ring-indigo-500 ring-offset-2"
          onClick={() => setOpen(true)}
        >
          <UserPlusIcon className="border-none h-[1.6rem] w-[1.6rem] relative" />
          {group && group.join_requests.length > 0 && (
            <span className="bg-blue-500 text-white rounded-full h-5 min-w-[1.1rem] font-semibold pt-[0.1rem] px-1.5 flex items-center justify-center text-xs absolute -top-3 left-[70%] z-10">
              {group.join_requests.length}
            </span>
          )}
        </button>
      )}
    </>
  )
}
