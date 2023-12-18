import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface TogglePunishmentsContextProps {
  isToggled: boolean
  setIsToggled: Dispatch<SetStateAction<boolean>>
}

export const TogglePunishmentsContext = createContext<TogglePunishmentsContextProps | undefined>(undefined)

export function useTogglePunishments() {
  const context = useContext(TogglePunishmentsContext)
  if (!context) {
    throw new Error("useTogglePunishments must be used within a TogglePunishmentsProvider")
  }

  return context
}

interface TogglePunishmentsProviderProps {
  children: ReactNode
}

export function TogglePunishmentsProvider({ children }: TogglePunishmentsProviderProps) {
  const [isToggled, setIsToggled] = useState(false)

  return (
    <TogglePunishmentsContext.Provider value={{ isToggled, setIsToggled }}>
      {children}
    </TogglePunishmentsContext.Provider>
  )
}
