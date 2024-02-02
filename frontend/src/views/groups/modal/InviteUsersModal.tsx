import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dispatch, FC, Fragment, SetStateAction, useEffect, useRef, useState } from "react"
import { Listbox, ListboxOption } from "../../../components/listbox/Listbox"
import {
  VengefulApiError,
  getDeleteGroupMemberUrl,
  getPatchGroupMemberPermissionsUrl,
  getTransferGroupOwnershipUrl,
  useGroupLeaderboard,
  useUserSearch,
} from "../../../helpers/api"
import { canGiveRole, hasPermission } from "../../../helpers/permissions"

import { Combobox, Transition } from "@headlessui/react"
import axios from "axios"
import { Button } from "../../../components/button"
import { MemberSelect } from "../../../components/input/MemberSelect"
import { Modal } from "../../../components/modal"
import { Spinner } from "../../../components/spinner"
import { useCurrentUser } from "../../../helpers/context/currentUserContext"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useConfirmModal } from "../../../helpers/context/modal/confirmModalContext"
import { useNotification } from "../../../helpers/context/notificationContext"
import { GroupUser } from "../../../helpers/types"
import { InputConfirmModal } from "../../../components/modal/InputConfirmModal"
import { ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { textToEmoji, userEmoji } from "../../../helpers/emojies"
import { useDebounce } from "use-debounce"
import { AiOutlineUsergroupAdd } from "react-icons/ai"
import { InviteUserButton } from "../../../components/button/InviteUserButton"

interface InviteGroupMembersModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const InviteUsersModal: FC<InviteGroupMembersModalProps> = ({ open, setOpen }) => {
  const { selectedGroup } = useGroupNavigation()
  const { setNotification } = useNotification()

  const [query, setQuery] = useState("")
  const { data: userSearchResults, isLoading: isSearching } = useUserSearch(query, 5)
  const [delayedLoading] = useDebounce(isSearching, 100)

  const ref = useRef(null)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Inviter andre til gruppen"
        description="Her kan du invitere nye gruppemedlemmer"
        setOpen={setOpen}
        includePrimaryButton={false}
        cancelButtonLabel="Lukk"
      >
        <div className="mb-4 md:mt-2 flex flex-col gap-6 font-normal h-80">
          <input
            className="w-full border-none text-sm leading-5 text-gray-900 focus:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            type={"text"}
            placeholder={"Søk etter bruker"}
          />
          <ul className="w-full border-none text-sm leading-5 text-gray-900 focus:ring-0 overflow-y-auto">
            {userSearchResults && (
              <>
                {userSearchResults
                  .filter((user) => !selectedGroup?.invites.find((invite) => invite.invite.user_id === user.user_id))
                  .map((user) => (
                    <li
                      key={user.user_id}
                      className="flex items-center gap-2 p-2 rounded-md bg-white mb-2 w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {userEmoji(user)}&nbsp;
                        {user.first_name} {user.last_name}
                      </span>
                      {selectedGroup && <InviteUserButton user_id={user.user_id} group_id={selectedGroup.group_id} />}
                    </li>
                  ))}
              </>
            )}
            {delayedLoading && !userSearchResults && (
              <div className="flex justify-center w-full">
                <Spinner />
              </div>
            )}
          </ul>
        </div>
      </Modal>
    </Transition.Root>
  )
}
