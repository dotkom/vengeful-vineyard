import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"
import { Group } from "../types"

interface SelectedGroupContextProps {
  selectedGroup: Group | undefined
  setSelectedGroup: Dispatch<SetStateAction<Group | undefined>>
}

const SelectedGroupContext = createContext<SelectedGroupContextProps | undefined>(undefined)

export function useSelectedGroup() {
  const context = useContext(SelectedGroupContext)
  if (!context) {
    throw new Error("useSelectedGroup must be used within a SelectedGroupContextProvider")
  }

  return context
}

interface SelectedGroupProviderProps {
  children: ReactNode
}

export function SelectedGroupProvider({ children }: SelectedGroupProviderProps) {
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(undefined)

  return (
    <SelectedGroupContext.Provider value={{ selectedGroup, setSelectedGroup }}>
      {children}
    </SelectedGroupContext.Provider>
  )
}
