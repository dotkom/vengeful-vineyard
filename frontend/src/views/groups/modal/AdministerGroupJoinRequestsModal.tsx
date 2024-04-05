import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Dispatch, FC, Fragment, SetStateAction, useEffect, useRef, useState } from "react"
import {
  groupLeaderboardQuery,
  postDenyGroupJoinRequestMutation,
  postAcceptGroupJoinRequestMutation,
  patchInviteCodeMutation,
} from "../../../helpers/api"

import { Transition } from "@headlessui/react"
import { Modal } from "../../../components/modal"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { copyToClipboard, generatePseudoRandomString } from "../../../helpers/utils"
import { TextInput } from "../../../components/input/TextInput"
import { Toggle } from "../../../components/input/Toggle"
import { usePermission } from "../../../helpers/permissions"
import { CopyIcon } from "@radix-ui/react-icons"

interface AdministerGroupJoinRequestsModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const AdministerGroupJoinRequestsModal: FC<AdministerGroupJoinRequestsModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)
  const { selectedGroup } = useGroupNavigation()

  const { mutate: acceptJoinRequestMutate } = useMutation(postAcceptGroupJoinRequestMutation(selectedGroup?.group_id))
  const { mutate: denyJoinRequestMutate } = useMutation(postDenyGroupJoinRequestMutation(selectedGroup?.group_id))
  const { mutate: patchInviteCodeMutate } = useMutation(patchInviteCodeMutation(selectedGroup?.group_id ?? ""))

  const { data: group } = useQuery(groupLeaderboardQuery(selectedGroup?.group_id))

  const canViewInviteCode = usePermission("group.invite_code.view", group)
  const canEditInviteCode = usePermission("group.invite_code.edit", group)

  const [inviteCode, setInviteCode] = useState<string | null>("")
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false)

  useEffect(() => {
    setInviteCode(group?.invite_code ?? null)
  }, [group])

  const inviteCodeToggleClickHandler = () => {
    const newInviteCode = inviteCode
      ? null
      : group?.invite_code?.trim()
      ? group.invite_code
      : generatePseudoRandomString(8)

    setInviteCode(newInviteCode)
    patchInviteCodeMutate(newInviteCode)
  }

  const copyIconClickHandler = () => {
    copyToClipboard(getInviteLink())
    setInviteLinkCopied(true)

    setTimeout(() => setInviteLinkCopied(false), 800)
  }

  function getInviteLink(): string {
    return `${window.location.origin}/gruppe/${group?.name_short}/${inviteCode}`
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Administrer gruppeforespørsler"
        description="Her kan du administrere innkommende gruppeforespørsler"
        setOpen={setOpen}
        includePrimaryButton={false}
      >
        <div className="md:mt-4 flex flex-col gap-6 font-normal relative group text-gray-800">
          {group?.ow_group_id === null && canViewInviteCode && (
            <div className="flex justify-between items-end">
              <div className="flex-grow">
                <TextInput
                  label="Invitasjonslink"
                  placeholder="Invitasjonslink er skrudd av"
                  contentEditable={false}
                  value={inviteCode ? getInviteLink() : ""}
                  disabled={true}
                  className="pr-10"
                >
                  <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                    <CopyIcon
                      onClick={copyIconClickHandler}
                      className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer"
                      visibility={inviteCode ? "visible" : "hidden"}
                    />
                    {inviteLinkCopied && (
                      <span className="absolute -top-6 -left-4 px-2 py-1 rounded shadow-lg ring-1 ring-black ring-opacity-5 text-xs text-gray-700 dark:text-gray-100 bg-white select-none">
                        Copied!
                      </span>
                    )}
                  </div>
                </TextInput>
              </div>
              {canEditInviteCode && (
                <div className="transform -translate-y-1/4 ml-2">
                  <Toggle value={!!inviteCode} changeHandler={inviteCodeToggleClickHandler} />
                </div>
              )}
            </div>
          )}
          {group?.join_requests.length === 0 ? (
            <p className="text-center mt-4">Ingen forespørsler</p>
          ) : (
            <ul className="flex flex-col text-sm divide-y gap-y-1">
              {group?.join_requests.map((user) => (
                <li
                  key={user.user_id}
                  className="flex flex-row items-center justify-between p-3 border border-gray-900/5 rounded-md bg-white"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {user.first_name} {user.last_name}
                    </span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => acceptJoinRequestMutate(user.user_id)}>
                      <CheckCircleIcon className="h-8 w-8 text-green-500 hover:text-green-600" />
                    </button>
                    <button onClick={() => denyJoinRequestMutate(user.user_id)}>
                      <XCircleIcon className="h-8 w-8 text-red-500 hover:text-red-600" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </Transition.Root>
  )
}
