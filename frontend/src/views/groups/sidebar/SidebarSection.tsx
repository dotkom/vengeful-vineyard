import { FC, ReactNode } from "react"

interface SidebarSectionProps {
  title?: string
  children: ReactNode
}

export const SidebarSection: FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="flex-col gap-y-1 hidden md:flex">
      <span className="ml-1 text-sm text-gray-600">{title}</span>
      {children}
    </div>
  )
}
