import React from "react"

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  suffix?: string
  error?: string
  changeHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void
}

export const NumberInput = ({ value, suffix, error, changeHandler, ...props }: NumberInputProps) => (
  <div className="mt-1">
    <div className="relative">
      <input
        type="number"
        name="number"
        id="number"
        className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
          error ? "border-red-400" : "border-gray-300"
        }`}
        value={value !== 0 ? value : ""}
        placeholder={"0"}
        onChange={changeHandler}
        {...props}
      />
      {suffix && (
        <div className="absolute right-2 top-0 h-full flex flex-row items-center text-sm text-gray-500">
          <span className="">{suffix}</span>
        </div>
      )}
    </div>
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
)
