import { FC } from "react"
import { Group } from "../../../helpers/types"
import { UserPlusIcon } from "@heroicons/react/24/outline"
import { isAtLeastAsValuableRole } from "../../../helpers/permissions"
import { useAdministerGroupJoinRequestsModal } from "../../../helpers/context/modal/administerGroupJoinRequestsModalContext"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import { useGroupLeaderboard } from "../../../helpers/api"

interface GroupJoinRequestsContainerProps {
  groupData: Group | undefined
}

export const GroupJoinRequestsContainer: FC<GroupJoinRequestsContainerProps> = ({ groupData }) => {
  const { setOpen } = useAdministerGroupJoinRequestsModal()
  const { currentUser } = useCurrentUser()
  const { data: group } = useGroupLeaderboard(groupData?.group_id)

  const currentUserRole = group?.members.find((member) => member.user_id === currentUser.user_id)?.permissions[0] ?? ""

  return (
    <>
      {groupData?.ow_group_id === null && isAtLeastAsValuableRole("group.admin", currentUserRole) && (
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
