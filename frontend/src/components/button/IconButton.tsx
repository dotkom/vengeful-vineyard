import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react"

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  color?: "BLUE" | "RED" | "GREEN" | "YELLOW"
  children?: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, color = "BLUE", children, ...rest }, ref) => {
    let colorClass = ""
    switch (color) {
      case "BLUE":
        colorClass = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
        break
      case "RED":
        colorClass = "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        break
      case "GREEN":
        colorClass = "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        break
      case "YELLOW":
        colorClass = "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500"
        break
    }

    return (
      <button
        ref={ref}
        className={`inline-flex gap-x-1 items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium text-white shadow-s focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClass}`}
        {...rest}
      >
        {children}
        {label && label}
      </button>
    )
  }
)
