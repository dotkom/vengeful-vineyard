import { AiFillInfoCircle } from "react-icons/ai";

interface ToggleProps {
  description?: string;
  label: string;
  value: boolean;
  changeHandler: () => void;
}

export const Toggle = ({
  description,
  label,
  value,
  changeHandler,
}: ToggleProps) => (
  <div className="flex items-center justify-between relative">
    { description ?
    <div className="group relative overflow-visible">
      <div className="absolute top-5 z-10 items-center opacity-0 group-hover:opacity-100 transition-opacity border-gray-200 rounded-2xl bg-white border-2">
        <p className="text-sm text-gray-500 p-4">{description}</p>
      </div>
      <p className="text-sm font-medium text-gray-900 cursor-pointer">
        {label} <AiFillInfoCircle className="text-gray-400 inline" />
      </p>
    </div>
      :
    <p className="text-sm font-medium text-gray-900 cursor-pointer">
      {label}
    </p>
    }
    <button
      type="button"
      aria-pressed="false"
      aria-labelledby="toggleLabel"
      className={`${
        value ? "bg-indigo-600" : "bg-gray-200"
      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
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
);

