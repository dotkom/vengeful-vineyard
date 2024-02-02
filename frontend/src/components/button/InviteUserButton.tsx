import { AiOutlineCheck, AiOutlineUsergroupAdd } from "react-icons/ai"
import { FC, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { inviteUserToGroup } from "../../helpers/api"

export const InviteUserButton: FC<{ group_id: string; user_id: string }> = ({ group_id, user_id }) => {
  const { mutate } = useMutation({
    mutationFn: (variables: { group_id: string; user_id: string }) =>
      inviteUserToGroup(variables.group_id, variables.user_id),
    onSuccess: () => setInvited(true),
  })
  const [invited, setInvited] = useState(false)

  return (
    <button
      className={"flex items-center gap-2 action p-1 rounded-md bg-indigo-500 hover:bg-indigo-600 text-white"}
      onClick={() => mutate({ group_id, user_id })}
      title="Inviter til gruppen"
    >
      {invited ? <AiOutlineCheck className="h-5 w-5" /> : <AiOutlineUsergroupAdd className="h-5 w-5 " />}
    </button>
  )
}
