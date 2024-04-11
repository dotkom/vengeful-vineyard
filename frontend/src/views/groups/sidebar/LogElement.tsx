import { FC } from "react"

interface LogElementProps {
  fromName: string
  toName?: string
  punishmentType: string
  punishmentValue: number
  reason?: string
  paid?: boolean
}

export const LogElement: FC<LogElementProps> = ({
  fromName,
  toName,
  punishmentType,
  punishmentValue,
  reason,
  paid,
}) => {
  let itemString = ""
  if (paid) {
    if (punishmentValue > 1) {
      itemString += `${fromName} betalte ${punishmentValue} ${punishmentType}er.`
    } else {
      itemString += `${fromName} betalte ${punishmentValue} ${punishmentType}.`
    }
  } else if (punishmentValue <= 0) {
    // Something went wrong
  } else if (punishmentValue === 1) {
    itemString += `${fromName} ga ${toName} ${punishmentValue} ${punishmentType}.`
  } else {
    itemString += `${fromName} ga ${toName} ${punishmentValue} ${punishmentType}er.`
  }
  const timestamp = new Date().toLocaleString() // TODO: Replace with actual timestamp, possibly a variable?
  return (
    <div className="border-[1px] border-gray-300 p-2 rounded-xl flex flex-col">
      <p className="text-gray-700 text-xs mb-1">{timestamp}</p>
      <p className="dark:text-white text-sm font-semibold">{itemString}</p>
      {reason && <p className="dark:text-white text-sm italic">Årsak: {reason}</p>}
    </div>
  )
}
