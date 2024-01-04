import { ChangeEvent, Dispatch, FC, Fragment, SetStateAction, useRef, useState } from "react"
import { Group, GroupUser } from "../../../helpers/types"
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useMutation } from "@tanstack/react-query"
import axios, { AxiosResponse } from "axios"
import { VengefulApiError, getAddPunishmentUrl, useGroupLeaderboard } from "../../../helpers/api"

import { AlcoholInput } from "../../../components/input/AlcoholInput"
import { Modal } from "../../../components/modal/Modal"
import { PersonSelect } from "../../../components/input/PersonSelect"
import { TextInput } from "../../../components/input/TextInput"
import { Toggle } from "../../../components/input/Toggle"
import { Transition } from "@headlessui/react"
import { useGivePunishmentModal } from "../../../helpers/context/modal/givePunishmentModalContext"
import { useNotification } from "../../../helpers/context/notificationContext"
import { z } from "zod"
import { useErrorControl } from "../../../helpers/form"

interface GivePunishmentModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  selectedGroup: Group
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<Group, unknown>>
}

const CreatePunishment = z.object({
  punishment_type_id: z.string().default(""),
  reason: z.string().default(""),
  reason_hidden: z.boolean().default(true),
  amount: z.number().min(1, { message: "Straffemengde må være minst 1" }).default(1),
})

export const GivePunishmentModal: FC<GivePunishmentModalProps> = ({ open, setOpen, selectedGroup, dataRefetch }) => {
  const ref = useRef(null)
  const { preferredSelectedPerson } = useGivePunishmentModal()
  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(preferredSelectedPerson)
  const [newPunishmentData, setNewPunishmentData] = useState(CreatePunishment.parse({}))
  const { setNotification } = useNotification()
  const [newPunishmentDataErrors, setNewPunishmentDataErrors] = useErrorControl(CreatePunishment)

  const onGroupLeaderboardFetched = (group: Group) => {
    setNewPunishmentData({
      ...newPunishmentData,
      punishment_type_id: group.punishment_types[0].punishment_type_id,
    })
  }

  const { data } = useGroupLeaderboard(selectedGroup.group_id, onGroupLeaderboardFetched)

  const createPunishmentCall = async () => {
    if (selectedPerson) {
      const ADD_PUNISHMENT_URL = getAddPunishmentUrl(selectedGroup.group_id, selectedPerson.user_id)
      const res: AxiosResponse<string> = await axios.post(ADD_PUNISHMENT_URL, [newPunishmentData])
      return res.data
    } else {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere straff",
        text: "Du må velge en person å gi straff til",
      })
    }
  }

  const { mutate } = useMutation(createPunishmentCall, {
    onSuccess: () => {
      dataRefetch()
      setNotification({
        type: "success",
        title: "Straff registrert!",
        text: `Du ga en straff til ${selectedPerson?.first_name}`,
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke registrere straff",
        text: e.response.data.detail,
      })
    },
  })

  const textInputHandler = (evt: ChangeEvent<HTMLInputElement>) =>
    setNewPunishmentData({ ...newPunishmentData, reason: evt.currentTarget.value })

  const reasonHiddenHandler = () =>
    setNewPunishmentData({
      ...newPunishmentData,
      reason_hidden: !newPunishmentData.reason_hidden,
    })

  const typeInputHandler = (evt: ChangeEvent<HTMLSelectElement>) =>
    setNewPunishmentData({
      ...newPunishmentData,
      punishment_type_id: evt.currentTarget.value,
    })
  const amountInputHandler = (evt: ChangeEvent<HTMLInputElement>) =>
    setNewPunishmentData({
      ...newPunishmentData,
      amount: Number(evt.currentTarget.value),
    })

  const handlePrimaryActionClick = (): boolean => {
    const data = CreatePunishment.safeParse(newPunishmentData)
    setNewPunishmentDataErrors(data)

    if (!data.success) return false

    mutate()
    return true
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Gi straff"
        description="Her kan du gi en straff"
        setOpen={setOpen}
        primaryButtonLabel="Gi straff"
        primaryButtonAction={handlePrimaryActionClick}
      >
        <div className="mt-4 flex flex-col gap-3 font-normal">
          {data ? (
            <>
              <PersonSelect
                label="Gi straff til"
                members={data.members}
                selectedPerson={selectedPerson}
                setSelectedPerson={setSelectedPerson}
              />
              {selectedGroup.ow_group_id !== null && (
                <Toggle
                  description={"Hvis du huker av her vil begrunnelsen vises på Wall of Shame"}
                  label={"Del begrunnelse"}
                  value={!newPunishmentData.reason_hidden}
                  changeHandler={reasonHiddenHandler}
                />
              )}
              <TextInput
                label="Begrunnelse"
                placeholder="Begrunnelse"
                value={newPunishmentData.reason}
                onChange={textInputHandler}
                error={newPunishmentDataErrors.reason}
              />
              <AlcoholInput
                label="Straffemengde (antall enheter)"
                type={newPunishmentData.punishment_type_id}
                amount={newPunishmentData.amount}
                data={data}
                typeInputHandler={typeInputHandler}
                amountInputHandler={amountInputHandler}
                error={newPunishmentDataErrors.amount}
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
