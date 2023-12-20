import { useEffect, useState } from "react"

import { MultipleToggleOption } from "./MultipleToggleOption"
import { SkeletonMultipleToggleOption } from "./SkeletonMultipleToggleOption"

export type ToggleOption<T = unknown> = {
  text: string
  value: T
  checked: boolean
}

interface MultipleToggleProps<T = unknown> {
  options: ToggleOption<T>[]
  onOptionClicked?: (option: ToggleOption<T>) => void
  isLoading?: boolean
}

export const MultipleToggle = <T,>({ options = [], onOptionClicked, isLoading = false }: MultipleToggleProps<T>) => {
  const [toggled, setToggled] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    setToggled(options.reduce((acc, option) => ({ ...acc, [String(option.value)]: option.checked }), {}))
  }, [options])

  return (
    <ul className="flex flex-row flex-wrap gap-1">
      {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonMultipleToggleOption key={i} />)}
      {(!isLoading ? options : []).map((option) => (
        <MultipleToggleOption
          key={String(option.value)}
          text={option.text}
          value={option.value}
          toggled={toggled[String(option.value)]}
          onClick={() => {
            setToggled((prev) => ({ ...prev, [String(option.value)]: !prev[String(option.value)] }))
            if (onOptionClicked) onOptionClicked(option)
          }}
        />
      ))}
    </ul>
  )
}
