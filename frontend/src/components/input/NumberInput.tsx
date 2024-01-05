import React from "react"

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  value: number
  suffix?: string
  error?: string
}

export const NumberInput = ({ label, value, suffix, error, ...props }: NumberInputProps) => {
  const randomId = Math.random().toString(36).substring(7)

  return (
    <div>
      <div className="relative flex flex-col gap-y-1">
        {label && (
          <label htmlFor={randomId} className="font-bold text-sm ml-1 text-gray-700">
            {label}
          </label>
        )}
        <input
          type="number"
          name="number"
          id={randomId}
          className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
            error ? "border-red-400" : "border-gray-300"
          }`}
          value={value !== 0 ? value : ""}
          placeholder={"0"}
          {...props}
        />
        {suffix && (
          <div className="absolute right-2 top-0 h-full flex flex-row items-center text-sm text-gray-500">
            <span className="">{suffix}</span>
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-sm ml-1">{error}</span>}
    </div>
  )
}
