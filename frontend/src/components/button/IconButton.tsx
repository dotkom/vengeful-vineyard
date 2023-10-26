import { forwardRef } from "react"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children?: React.ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({label, children, ...rest}, ref) => (
  <button
    ref={ref}
    className="inline-flex gap-x-1 items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    {...rest}
  >
    {children}
    {label}
  </button>
))
