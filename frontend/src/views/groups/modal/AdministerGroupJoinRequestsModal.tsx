import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dispatch, FC, Fragment, SetStateAction, useRef } from "react"
import {
  VengefulApiError,
  getPostAcceptGroupJoinRequestUrl,
  getPostDenyGroupJoinRequestUrl,
  groupLeaderboardQuery,
} from "../../../helpers/api"

import { Transition } from "@headlessui/react"
import axios from "axios"
import { Modal } from "../../../components/modal"
import { useNotification } from "../../../helpers/context/notificationContext"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"

interface AdministerGroupJoinRequestsModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const AdministerGroupJoinRequestsModal: FC<AdministerGroupJoinRequestsModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)
  const { setNotification } = useNotification()
  const { selectedGroup } = useGroupNavigation()
  const queryClient = useQueryClient()

  const { data: group } = useQuery(groupLeaderboardQuery(selectedGroup?.group_id))

  const { mutate: acceptJoinRequestMutate } = useMutation(
    async (userId: string) => await axios.post(getPostAcceptGroupJoinRequestUrl(selectedGroup?.group_id ?? "", userId)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroup?.group_id] })
        setNotification({
          type: "success",
          text: "Brukeren ble lagt til i gruppen",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke godkjenne forespørselen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: denyJoinRequestMutate } = useMutation(
    async (userId: string) => await axios.post(getPostDenyGroupJoinRequestUrl(selectedGroup?.group_id ?? "", userId)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroup?.group_id] })
        setNotification({
          type: "success",
          text: "Forespørselen ble avslått",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke avslå forespørselen",
          text: e.response.data.detail,
        })
      },
    }
  )

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
