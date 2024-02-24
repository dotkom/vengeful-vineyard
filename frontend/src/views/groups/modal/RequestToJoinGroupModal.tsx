import { Dispatch, FC, Fragment, SetStateAction, useEffect, useRef, useState } from "react"
import { VengefulApiError, getGroupsSearchUrl, getPostGroupJoinRequestUrl } from "../../../helpers/api"
import { useMutation, useQuery } from "@tanstack/react-query"

import { GroupBase } from "../../../helpers/types"
import { Modal } from "../../../components/modal"
import { TextInput } from "../../../components/input/TextInput"
import { Transition } from "@headlessui/react"
import axios from "axios"
import { useNotification } from "../../../helpers/context/notificationContext"

interface RequestToJoinGroupModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const RequestToJoinGroupModal: FC<RequestToJoinGroupModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setNotification } = useNotification()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<GroupBase | undefined>(undefined)

  const enabled = searchTerm.length > 0 && selectedGroup === undefined

  const { data: groups, isLoading: groupsSearchIsLoading } = useQuery({
    queryKey: ["groupsSearch", searchTerm],
    queryFn: () => axios.get<GroupBase[]>(getGroupsSearchUrl(searchTerm)).then((res) => res.data),
    enabled,
  })

  const { mutate: requestToJoinGroupMutate } = useMutation(
    async () => await axios.post(getPostGroupJoinRequestUrl(selectedGroup?.group_id ?? "")),
    {
      onSuccess: () => {
        setNotification({
          type: "success",
          text: `Forespørselen ble sendt`,
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke sende forespørselen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const handleSearchResultClick = (group: GroupBase) => {
    setSelectedGroup(group)
    setSearchTerm(group.name)
    inputRef.current?.blur()
  }

  const handleRequestToJoinClicked = (): boolean => {
    requestToJoinGroupMutate()
    setSearchTerm("")
    return true
  }

  useEffect(() => {
    if (selectedGroup?.name !== searchTerm) setSelectedGroup(undefined)
  }, [searchTerm])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Spør om å bli med i en gruppe"
        description="Her kan du spørre om å bli med i en gruppe"
        setOpen={setOpen}
        primaryButtonLabel="Send forespørsel"
        primaryButtonAction={handleRequestToJoinClicked}
        primaryButtonDisabled={selectedGroup === undefined}
      >
        <div className="mb-4 md:mt-4 flex flex-col gap-6 font-normal relative group">
          <TextInput
            ref={inputRef}
            label="Søk etter gruppe"
            name="group_name"
            placeholder="Skriv inn et gruppenavn"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            isLoading={groupsSearchIsLoading && enabled}
          />
          <div className="flex flex-col absolute top-16 bg-white drop-shadow-2xl w-full divide-y divide-gray-900/5 rounded-b-md overflow-hidden">
            {groups?.map((group) => (
              <button
                className="flex flex-col hover:bg-indigo-100/50 py-2 px-3 justify-start items-start"
                onClick={() => handleSearchResultClick(group)}
              >
                <span className="font-semibold text-black">{group.name}</span>
                <span className="text-sm text-gray-900">{group.name_short}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </Transition.Root>
  )
}
