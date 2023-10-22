import { AiFillInfoCircle } from "react-icons/ai"

interface ToggleProps {
  description?: string
  label: string
  value: boolean
  changeHandler: () => void
}

export const Toggle = ({ description, label, value, changeHandler }: ToggleProps) => (
  <div className="relative flex items-center justify-between">
    {description ? (
      <div className="group relative overflow-visible">
        <div className="absolute top-5 z-10 hidden items-center rounded-2xl border-2 border-gray-200 bg-white transition-opacity group-hover:block">
          <p className="p-4 text-sm text-gray-500">{description}</p>
        </div>
        <p className="cursor-pointer text-sm font-medium text-gray-900">
          {label} <AiFillInfoCircle className="inline text-gray-400" />
        </p>
      </div>
    ) : (
      <p className="cursor-pointer text-sm font-medium text-gray-900">{label}</p>
    )}
    <button
      type="button"
      aria-pressed="false"
      aria-labelledby="toggleLabel"
      className={`${
        value ? "bg-indigo-600" : "bg-gray-200"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
      onClick={changeHandler}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`${
          value ? "translate-x-5" : "translate-x-0"
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
)
