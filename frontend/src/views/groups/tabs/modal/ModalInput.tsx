import { Group, GroupUser } from "../../../../helpers/types"

import { AlcoholInput } from "./AlcoholInput"
import { PersonSelect } from "./PersonSelect"
import { TextInput } from "./TextInput"
import { Toggle } from "./Toggle"
import React from "react"

interface ModalInputProps {
  newPunishment: {
    punishment_type_id: number
    reason: string
    reason_hidden: boolean
    amount: number
  }
  setNewPunishment: React.Dispatch<
    React.SetStateAction<{
      punishment_type_id: number
      reason: string
      reason_hidden: boolean
      amount: number
    }>
  >
  data: Group
  selectedPerson: GroupUser | undefined
  setSelectedPerson: React.Dispatch<React.SetStateAction<GroupUser | undefined>>
}

export const ModalInput = ({
  newPunishment,
  setNewPunishment,
  data,
  selectedPerson,
  setSelectedPerson,
}: ModalInputProps) => {
  const textInputHandler = (evt: React.ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({ ...newPunishment, reason: evt.currentTarget.value })

  const reasonHiddenHandler = () =>
    setNewPunishment({
      ...newPunishment,
      reason_hidden: !newPunishment.reason_hidden,
    })

  const typeInputHandler = (evt: React.ChangeEvent<HTMLSelectElement>) =>
    setNewPunishment({
      ...newPunishment,
      punishment_type_id: Number(evt.currentTarget.value),
    })
  const amountInputHandler = (evt: React.ChangeEvent<HTMLInputElement>) =>
    setNewPunishment({
      ...newPunishment,
      amount: Number(evt.currentTarget.value),
    })

  return (
    <div className="mb-4 flex flex-col gap-2 font-normal">
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
    </div>
  )
}
