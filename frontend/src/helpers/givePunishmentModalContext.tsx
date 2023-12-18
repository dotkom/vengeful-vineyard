import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

import { GroupUser } from "./types"

interface GivePunishmentModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  preferredSelectedPerson: GroupUser | undefined
  setPreferredSelectedPerson: Dispatch<SetStateAction<GroupUser | undefined>>
}

const GivePunishmentModalContext = createContext<GivePunishmentModalContextProps | undefined>(undefined)

export function useGivePunishmentModal() {
  const context = useContext(GivePunishmentModalContext)
  if (!context) {
    throw new Error("useGivePunishmentModal must be used within a GivePunishmentModalProvider")
  }

  return context
}

interface GivePunishmentModalProviderProps {
  children: ReactNode
}

export function GivePunishmentModalProvider({ children }: GivePunishmentModalProviderProps) {
  const [open, setOpen] = useState(false)
  const [preferredSelectedPerson, setPreferredSelectedPerson] = useState<GroupUser | undefined>(undefined)

  return (
    <GivePunishmentModalContext.Provider value={{ open, setOpen, preferredSelectedPerson, setPreferredSelectedPerson }}>
      {children}
    </GivePunishmentModalContext.Provider>
  )
}
