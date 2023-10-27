import { Group, GroupUser } from "../../../../helpers/types"

import { PersonSelect } from "../../../../components/input/PersonSelect"
import React from "react"
import { NumberInput } from "../../../../components/input/NumberInput"

interface RegisterPaymentModalInputProps {
  newPaymentLog: {
    value: number
  }
  setNewPaymentLog: React.Dispatch<
    React.SetStateAction<{
      value: number
    }>
  >
  data: Group | undefined
  selectedPerson: GroupUser | undefined
  setSelectedPerson: React.Dispatch<React.SetStateAction<GroupUser | undefined>>
}

export const RegisterPaymentModalInput = ({
  newPaymentLog,
  setNewPaymentLog,
  data,
  selectedPerson,
  setSelectedPerson,
}: RegisterPaymentModalInputProps) => {
  const valueInputHandler = (evt: React.ChangeEvent<HTMLInputElement>) =>
    setNewPaymentLog({ value: Number(evt.currentTarget.value) })

  if (!data) return <p>Loading...</p>

  return (
    <div className="mb-4 flex flex-col gap-2 font-normal">
      <PersonSelect data={data} selectedPerson={selectedPerson} setSelectedPerson={setSelectedPerson} />
      <NumberInput value={newPaymentLog.value} suffix="NOK" changeHandler={valueInputHandler} />
    </div>
  )
}
