import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react"

import { classNames } from "../../helpers/classNames"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: "REGULAR" | "OUTLINE"
  color?: "BLUE" | "RED" | "GREEN" | "YELLOW"
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label, variant = "REGULAR", color = "BLUE", children, className, disabled, ...rest }, ref) => {
    let colorClass = ""

    switch (variant) {
      case "REGULAR":
        switch (color) {
          case "BLUE":
            colorClass = "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            break
          case "RED":
            colorClass = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
            break
          case "GREEN":
            colorClass = "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500"
            break
          case "YELLOW":
            colorClass = "text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
            break
        }
        break
      case "OUTLINE":
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
        break
    }

    if (disabled) {
      switch (variant) {
        case "REGULAR":
          colorClass = "text-gray-600 bg-gray-200 dark:bg-gray-800 dark:border-0 cursor-not-allowed"
          break
        case "OUTLINE":
          colorClass = "text-gray-400 border-gray-600 bg-gray-100 cursor-not-allowed"
          break
      }
    }

    return (
      <button
        ref={ref}
        className={classNames(
          colorClass,
          className ?? "",
          `flex flex-row gap-x-1 items-center rounded-md border px-3 py-2 text-sm font-medium shadow-s focus:outline-none focus:ring-2 focus:ring-offset-2`
        )}
        disabled={disabled}
        {...rest}
      >
        {children}
        {label}
      </button>
    )
  }
)
