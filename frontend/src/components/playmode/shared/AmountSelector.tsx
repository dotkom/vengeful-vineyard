import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"

interface AmountSelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  fullscreen?: boolean
}

export const AmountSelector = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  fullscreen = false,
}: AmountSelectorProps) => {
  const buttonClass = fullscreen
    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"

  const textClass = fullscreen ? "text-white" : "text-gray-900 dark:text-gray-100"

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className={`rounded-full border p-1 disabled:opacity-50 ${buttonClass}`}
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className={`text-lg font-bold w-6 text-center ${textClass}`}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className={`rounded-full border p-1 disabled:opacity-50 ${buttonClass}`}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
