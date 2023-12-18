import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react"

import { classNames } from "../../helpers/classNames"

interface BorderedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  color?: "BLUE" | "RED" | "GREEN" | "YELLOW"
  children?: ReactNode
}

export const BorderedButton = forwardRef<HTMLButtonElement, BorderedButtonProps>(
  ({ label, color = "BLUE", children, className, ...rest }, ref) => {
    let colorClass = ""
    switch (color) {
      case "BLUE":
        colorClass = "text-indigo-400 border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500"
        break
      case "RED":
        colorClass = "text-red-400 border-red-600 hover:bg-red-50 focus:ring-red-500"
        break
      case "GREEN":
        colorClass = "text-green-400 border-green-600 hover:bg-green-50 focus:ring-green-500"
        break
      case "YELLOW":
        colorClass = "text-yellow-400 border-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500"
        break
    }

    return (
      <button
        ref={ref}
        className={classNames(
          colorClass,
          className ?? "",
          `inline-flex gap-x-1 items-center rounded-md border px-3 py-2 text-sm font-medium shadow-s focus:outline-none focus:ring-2 focus:ring-offset-2`
        )}
        {...rest}
      >
        {children}
        {label}
      </button>
    )
  }
)
