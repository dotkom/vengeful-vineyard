import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation, useQuery } from "@tanstack/react-query"
import { Dispatch, FC, Fragment, SetStateAction, useContext, useRef, useState } from "react"
import { Group, GroupUser } from "../../../../helpers/types"
import { NotificationContext } from "../../../../helpers/notificationContext"
import axios, { AxiosResponse } from "axios"
import { getAddPunishmentUrl, getGroupLeaderboardUrl } from "../../../../helpers/api"
import { sortGroupUsers } from "../../../../helpers/sorting"
import { Modal } from "../../../../components/modal/Modal"
import { GivePunishmentModalInput } from "./GivePunishmentModalInput"
import { Transition } from "@headlessui/react"

interface GivePunishmentModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedGroup: Group
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>
}

export const GivePunishmentModal: FC<GivePunishmentModalProps> = ({ open, setOpen, selectedGroup, dataRefetch }) => {
  const ref = useRef(null)
  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(undefined)
  const [newPunishment, setNewPunishment] = useState({
    punishment_type_id: 1,
    reason: "",
    reason_hidden: true,
    amount: 1,
  })
  const { setNotification } = useContext(NotificationContext)

  const { data } = useQuery({
    queryKey: ["groupLeaderboard", selectedGroup?.group_id],
    queryFn: () =>
      axios.get(getGroupLeaderboardUrl(selectedGroup.group_id)).then((res: AxiosResponse<Group>) => {
        setSelectedPerson(res.data.members[0])
        setNewPunishment((prev) => ({
          ...prev,
          punishment_type_id: res.data.punishment_types[0].punishment_type_id,
        }))
        const group = res.data
        group.members = sortGroupUsers(group.members, group.punishment_types)
        return group
      }),
  })

  const createPunishmentCall = async () => {
    if (selectedPerson) {
      const ADD_PUNISHMENT_URL = getAddPunishmentUrl(selectedGroup.group_id, selectedPerson.user_id)
      const res: AxiosResponse<string> = await axios.post(ADD_PUNISHMENT_URL, [newPunishment])
      return res.data
    } else {
      console.log("......")
    }
  }

  const { mutate } = useMutation(createPunishmentCall, {
    onSuccess: () => {
      dataRefetch()
      setNotification({
        show: true,
        title: "Straff registrert!",
        text: `Du ga en straff til ${selectedPerson?.first_name}`,
      })
    },
    onError: () => {
      console.log("Todo: Handle error")
    },
  })

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Gi straff"
        setOpen={setOpen}
        primaryButtonLabel="Gi straff"
        primaryButtonAction={() => mutate()}
      >
        <p className="text-sm text-gray-500">Her kan du lage en ny vinstraff</p>
        <GivePunishmentModalInput
          newPunishment={newPunishment}
          setNewPunishment={setNewPunishment}
          data={data}
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
        />
      </Modal>
    </Transition.Root>
  )
}
