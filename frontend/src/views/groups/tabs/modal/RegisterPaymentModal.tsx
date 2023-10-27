import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation, useQuery } from "@tanstack/react-query"
import { Group, GroupUser } from "../../../../helpers/types"
import { Dispatch, FC, Fragment, SetStateAction, useContext, useRef, useState } from "react"
import { Modal } from "../../../../components/modal/Modal"
import { Transition } from "@headlessui/react"
import { NotificationContext } from "../../../../helpers/notificationContext"
import { RegisterPaymentModalInput } from "./RegisterPaymentModalInput"
import axios, { AxiosResponse } from "axios"
import { getAddPaymentLogUrl, getGroupLeaderboardUrl } from "../../../../helpers/api"
import { sortGroupUsers } from "../../../../helpers/sorting"

interface RegisterPaymentModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedGroup: Group
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>
}

export const RegisterPaymentModal: FC<RegisterPaymentModalProps> = ({ open, setOpen, selectedGroup, dataRefetch }) => {
  const ref = useRef(null)

  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(undefined)
  const [newPaymentLog, setNewPaymentLog] = useState({
    value: 0,
  })
  const { setNotification } = useContext(NotificationContext)

  const { data } = useQuery({
    queryKey: ["groupLeaderboard", selectedGroup?.group_id],
    queryFn: () =>
      axios.get(getGroupLeaderboardUrl(selectedGroup.group_id)).then((res: AxiosResponse<Group>) => {
        setSelectedPerson(res.data.members[0])
        const group = res.data
        group.members = sortGroupUsers(group.members, group.punishment_types)
        return group
      }),
  })

  const createPaymentLogCall = async () => {
    if (selectedPerson) {
      const ADD_PUNISHMENT_URL = getAddPaymentLogUrl(selectedGroup.group_id, selectedPerson.user_id)
      const res: AxiosResponse<string> = await axios.post(ADD_PUNISHMENT_URL, newPaymentLog)
      return res.data
    } else {
      console.log("......")
    }
  }

  const { mutate } = useMutation(createPaymentLogCall, {
    onSuccess: () => {
      dataRefetch()
      setNotification({
        show: true,
        title: "Betaling registrert",
        text: `Du registrerte en betaling på ${selectedPerson?.first_name} for ${newPaymentLog.value}kr`,
      })
    },
    onError: () => {
      setNotification({
        show: true,
        title: "Noe gikk galt",
        text: "Kunne ikke registrere betaling",
      })
    },
  })

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        title="Register payment"
        setOpen={setOpen}
        ref={ref}
        primaryButtonLabel="Registrer betaling"
        primaryButtonAction={() => mutate()}
      >
        <RegisterPaymentModalInput
          newPaymentLog={newPaymentLog}
          setNewPaymentLog={setNewPaymentLog}
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
          data={data}
        />
      </Modal>
    </Transition.Root>
  )
}
