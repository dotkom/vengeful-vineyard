import { FC } from "react"

interface MultipleToggleOptionProps<T = unknown> {
  text: string
  value: T
  toggled: boolean
  onClick: (value: T) => void
}

export const MultipleToggleOption: FC<MultipleToggleOptionProps> = ({ text, value, toggled, onClick }) => {
  return (
    <li>
      <button
        className={`px-3 py-2 border border-gray-900/7 rounded-full text-sm cursor-pointer ${
          toggled ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-900/5"
        }`}
        onClick={() => onClick(value)}
      >
        <span className="">{text}</span>
      </button>
    </li>
  )
}
