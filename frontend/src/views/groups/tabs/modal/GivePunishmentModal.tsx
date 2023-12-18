import { ChangeEvent, Dispatch, FC, Fragment, SetStateAction, useContext, useRef, useState } from "react"
import { Group, GroupUser } from "../../../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from "@tanstack/react-query"
import axios, { AxiosResponse } from "axios"
import { getAddPunishmentUrl, useGroupLeaderboard } from "../../../../helpers/api"

import { AlcoholInput } from "../../../../components/input/AlcoholInput"
import { Modal } from "../../../../components/modal/Modal"
import { NotificationContext } from "../../../../helpers/notificationContext"
import { PersonSelect } from "../../../../components/input/PersonSelect"
import { TextInput } from "../../../../components/input/TextInput"
import { Toggle } from "../../../../components/input/Toggle"
import { Transition } from "@headlessui/react"
import { useGivePunishmentModal } from "../../../../helpers/givePunishmentModalContext"

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
  const { preferredSelectedPerson } = useGivePunishmentModal()
  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(preferredSelectedPerson)
  const [newPunishment, setNewPunishment] = useState({
    punishment_type_id: 1,
    reason: "",
    reason_hidden: true,
    amount: 1,
  })
  const { setNotification } = useContext(NotificationContext)

  const { data } = useGroupLeaderboard(selectedGroup.group_id)

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
        type: "success",
        title: "Straff registrert!",
        text: `Du ga en straff til ${selectedPerson?.first_name}`,
      })
    },
    onError: () => {
      setNotification({
        show: true,
        type: "error",
        title: "Noe gikk galt",
        text: "Kunne ikke registrere straff",
      })
    },
  })

  const textInputHandler = (evt: ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({ ...newPunishment, reason: evt.currentTarget.value })

  const reasonHiddenHandler = () =>
    setNewPunishment({
      ...newPunishment,
      reason_hidden: !newPunishment.reason_hidden,
    })

  const typeInputHandler = (evt: ChangeEvent<HTMLSelectElement>) =>
    setNewPunishment({
      ...newPunishment,
      punishment_type_id: Number(evt.currentTarget.value),
    })
  const amountInputHandler = (evt: ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({
      ...newPunishment,
      amount: Number(evt.currentTarget.value),
    })

  const handlePrimaryActionClick = (): boolean => {
    mutate()
    return true
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Gi straff"
        setOpen={setOpen}
        primaryButtonLabel="Gi straff"
        primaryButtonAction={handlePrimaryActionClick}
      >
        <p className="text-sm text-gray-500">Her kan du lage en ny vinstraff</p>
        <div className="mb-4 flex flex-col gap-2 font-normal">
          {data ? (
            <>
              <PersonSelect data={data} selectedPerson={selectedPerson} setSelectedPerson={setSelectedPerson} />
              <Toggle
                description={"Hvis du huker av her vil begrunnelsen vises på Wall of Shame"}
                label={"Del begrunnelse"}
                value={!newPunishment.reason_hidden}
                changeHandler={reasonHiddenHandler}
              />
              <TextInput placeholder="Begrunnelse" value={newPunishment.reason} changeHandler={textInputHandler} />
              <AlcoholInput
                type={newPunishment.punishment_type_id}
                amount={newPunishment.amount}
                data={data}
                typeInputHandler={typeInputHandler}
                amountInputHandler={amountInputHandler}
              />
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </Modal>
    </Transition.Root>
  )
}
