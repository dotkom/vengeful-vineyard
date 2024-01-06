import { AiFillInfoCircle } from "react-icons/ai"

interface ToggleProps {
  description?: string
  label?: string
  value: boolean
  changeHandler: () => void
}

export const Toggle = ({ description, label, value, changeHandler }: ToggleProps) => (
  <div className="flex flex-col relative">
    {label && (
      <div className="font-bold text-sm ml-1 mb-0.5 text-gray-700 flex flex-row gap-x-1 items-center">
        <span>{label}</span>
        {description && (
          <div className="group">
            <AiFillInfoCircle className="text-gray-400" />
            <div className="absolute z-10 top-5 right-0 items-center hidden group-hover:block transition-opacity border-gray-200 rounded-2xl bg-white border-2">
              <p className="text-sm font-normal text-gray-500 p-4">{description}</p>
            </div>
          </div>
        )}
      </div>
    )}
    <button
      type="button"
      aria-pressed="false"
      aria-labelledby="toggleLabel"
      className={`${
        value ? "bg-indigo-600" : "bg-gray-200"
      } ml-px relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      onClick={changeHandler}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`${
          value ? "translate-x-5" : "translate-x-0"
        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
      />
    </button>
  </div>
)
