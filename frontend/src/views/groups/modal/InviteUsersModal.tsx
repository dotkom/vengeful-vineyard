import { Dispatch, FC, Fragment, SetStateAction, useRef, useState } from "react"
import { useUserSearch } from "../../../helpers/api"

import { Transition } from "@headlessui/react"
import { Modal } from "../../../components/modal"
import { Spinner } from "../../../components/spinner"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useDebounce } from "use-debounce"
import { InviteUserButton } from "../../../components/button/InviteUserButton"
import { userEmoji } from "../../../helpers/emojies"

interface InviteGroupMembersModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const InviteUsersModal: FC<InviteGroupMembersModalProps> = ({ open, setOpen }) => {
  const { selectedGroup } = useGroupNavigation()

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
            className="w-full border-none text-sm leading-5 text-gray-900 focus:ring-0 bg-white"
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
