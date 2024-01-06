import { Group } from "../../helpers/types"
import React from "react"

interface AlcoholInputProps {
  label?: string
  type: string
  amount: number
  data: Group
  error?: string
  typeInputHandler: (evt: React.ChangeEvent<HTMLSelectElement>) => void
  amountInputHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void
}

export const AlcoholInput = ({
  label,
  type,
  amount,
  data,
  error,
  typeInputHandler,
  amountInputHandler,
}: AlcoholInputProps) => {
  const randomId = Math.random().toString(36).substring(7)

  return (
    <div className="-mt-0.5">
      {label && (
        <label htmlFor={randomId} className="font-bold text-sm ml-1 text-gray-700">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          name="price"
          id={randomId}
          className="block w-full rounded-md border-gray-300 pl-3 pr-12 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="0"
          value={amount.toString()}
          onChange={amountInputHandler}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label htmlFor="currency" className="sr-only">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-sm text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
            value={type}
            onChange={typeInputHandler}
          >
            {data.punishment_types.map((ptype) => (
              <option key={ptype.punishment_type_id} value={ptype.punishment_type_id} title={`Verdi: ${ptype.value}kr`}>
                {ptype.name} {ptype.emoji}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <span className="text-red-500 text-sm ml-1">{error}</span>}
    </div>
  )
}
