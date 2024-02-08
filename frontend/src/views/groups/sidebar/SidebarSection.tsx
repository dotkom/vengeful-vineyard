import { FC, ReactNode } from "react"

interface SidebarSectionProps {
  title?: string
  children: ReactNode
}

export const SidebarSection: FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-y-1 hidden md:block">
      <span className="ml-1 text-sm text-gray-600">{title}</span>
      {children}
    </div>
  )
}
