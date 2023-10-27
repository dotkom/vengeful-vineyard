import { Group, GroupUser } from "../../../../helpers/types"

import { AlcoholInput } from "../../../../components/input/AlcoholInput"
import { PersonSelect } from "../../../../components/input/PersonSelect"
import { TextInput } from "../../../../components/input/TextInput"
import { Toggle } from "../../../../components/input/Toggle"
import React from "react"

interface GivePunishmentModalInputProps {
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
  data: Group | undefined
  selectedPerson: GroupUser | undefined
  setSelectedPerson: React.Dispatch<React.SetStateAction<GroupUser | undefined>>
}

export const GivePunishmentModalInput = ({
  newPunishment,
  setNewPunishment,
  data,
  selectedPerson,
  setSelectedPerson,
}: GivePunishmentModalInputProps) => {
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

  if (!data) return <p>Loading...</p>

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
