import { FC, ReactNode } from "react"

interface SidebarSectionProps {
  title?: string
  children: ReactNode
  action?: ReactNode
}

export const SidebarSection: FC<SidebarSectionProps> = ({ title, children, action }) => {
  return (
    <div className="flex-col gap-y-1">
      <div className="flex items-center justify-between">
        <span className="ml-1 text-sm text-gray-600">{title}</span>
        {action}
      </div>
      {children}
    </div>
  )
}
