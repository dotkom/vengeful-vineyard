import React from "react"

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  suffix?: string
  changeHandler: (evt: React.ChangeEvent<HTMLInputElement>) => void
}

export const NumberInput = ({ value, suffix, changeHandler, ...props }: NumberInputProps) => (
  <div className="mt-1 relative">
    <input
      type="number"
      name="number"
      id="number"
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
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
)
