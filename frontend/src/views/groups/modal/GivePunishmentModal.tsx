import { useMutation, useQuery } from "@tanstack/react-query"
import { ChangeEvent, Dispatch, FC, Fragment, SetStateAction, useEffect, useRef, useState } from "react"
import { addManyPunishmentsMutation, groupLeaderboardQuery } from "../../../helpers/api"
import { Group, GroupUser } from "../../../helpers/types"

import { Transition } from "@headlessui/react"
import { z } from "zod"
import AlcoholGame from "../../../components/alcoholGame"
import { AlcoholInput } from "../../../components/input/AlcoholInput"
import { PersonSelect } from "../../../components/input/PersonSelect"
import { TextInput } from "../../../components/input/TextInput"
import { Toggle } from "../../../components/input/Toggle"
import { Modal } from "../../../components/modal/Modal"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useGivePunishmentModal } from "../../../helpers/context/modal/givePunishmentModalContext"
import { useErrorControl } from "../../../helpers/form"
import { sortGroupUsersByName } from "../../../helpers/sorting"

interface GivePunishmentModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CreatePunishment = z.object({
  punishment_type_id: z.string().default(""),
  reason: z.string().default(""),
  reason_hidden: z.boolean().default(false),
  amount: z
    .number()
    .min(1, { message: "Straffemengde må være minst 1" })
    .max(9, { message: "Straffemengde må være maks 9" })
    .default(1),
})

export const GivePunishmentModal: FC<GivePunishmentModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)
  const { preferredSelectedPerson } = useGivePunishmentModal()
  const [selectedPerson, setSelectedPerson] = useState<GroupUser | undefined>(preferredSelectedPerson)
  const [newPunishmentData, setNewPunishmentData] = useState(CreatePunishment.parse({}))
  const [newPunishmentDataErrors, setNewPunishmentDataErrors] = useErrorControl(CreatePunishment)
  const { selectedGroup } = useGroupNavigation()
  const [showAlcoholTest, setShowAlcoholTest] = useState(false)

  const onGroupLeaderboardFetched = (group: Group) => {
    setSelectedPerson(preferredSelectedPerson ?? group.members[0])
    setNewPunishmentData({
      ...newPunishmentData,
      punishment_type_id: Object.keys(group.punishment_types)[0],
    })
  }

  useEffect(() => {
    if (preferredSelectedPerson && preferredSelectedPerson.user_id !== selectedPerson?.user_id)
      setSelectedPerson(preferredSelectedPerson)
  }, [preferredSelectedPerson])

  const { data } = useQuery({
    ...groupLeaderboardQuery(selectedGroup?.group_id),
    onSuccess: onGroupLeaderboardFetched,
  })
  const sortedMembers = sortGroupUsersByName([...(data?.members ?? [])])

  const { mutate } = useMutation(
    addManyPunishmentsMutation([newPunishmentData], selectedGroup?.group_id, selectedPerson?.user_id)
  )

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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent)
    const isAfter8PM = new Date().getHours() >= 20

    if (isMobile && isAfter8PM) {
      setShowAlcoholTest(!showAlcoholTest)
    }
    if (isMobile && !showAlcoholTest && isAfter8PM) {
      return false
    }

    const data = CreatePunishment.safeParse(newPunishmentData)
    setNewPunishmentDataErrors(data)

    if (!data.success) return false

    setOpen(false)
    mutate()
    return true
  }

  const quitModal = () => {
    setShowAlcoholTest(false)
    setOpen(false)
  }

  return (
    <>
      {showAlcoholTest ? (
        <AlcoholGame next={handlePrimaryActionClick} quit={quitModal} />
      ) : (
        <Transition.Root show={open} as={Fragment}>
          <Modal
            ref={ref}
            title="Gi straff"
            description="Her kan du gi en straff"
            setOpen={setOpen}
            primaryButtonLabel="Gi straff"
            primaryButtonAction={handlePrimaryActionClick}
          >
            <div className="mt-4 flex flex-col gap-4 font-normal">
              {data ? (
                <>
                  <PersonSelect
                    label="Gi straff til"
                    members={sortedMembers}
                    selectedPerson={selectedPerson}
                    setSelectedPerson={setSelectedPerson}
                  />
                  <TextInput
                    label="Begrunnelse"
                    placeholder="Begrunnelse"
                    value={newPunishmentData.reason}
                    onChange={textInputHandler}
                    error={newPunishmentDataErrors.reason}
                  />
                  {selectedGroup?.ow_group_id !== null && (
                    <Toggle
                      label={"Vis begrunnelse på Wall of Shame"}
                      value={!newPunishmentData.reason_hidden}
                      changeHandler={reasonHiddenHandler}
                    />
                  )}

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
      )}
    </>
  )
}
