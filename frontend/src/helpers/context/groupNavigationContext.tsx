import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"
import { Group } from "../types"

interface GroupNavigationContextProps {
  selectedGroup: Group | undefined
  setSelectedGroup: Dispatch<SetStateAction<Group | undefined>>
}

export const GroupNavigationContext = createContext<GroupNavigationContextProps | undefined>(undefined)

export function useGroupNavigation() {
  const context = useContext(GroupNavigationContext)
  if (!context) {
    throw new Error("useGroupNavigation must be used within a GroupNavigationProvider")
  }

  return context
}

interface GroupNavigationProviderProps {
  children: ReactNode
}

export function GroupNavigationProvider({ children }: GroupNavigationProviderProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined)

  return (
    <GroupNavigationContext.Provider value={{ selectedGroup, setSelectedGroup }}>
      {children}
    </GroupNavigationContext.Provider>
  )
}
