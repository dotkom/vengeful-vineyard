import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface InviteUsersModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const InviteUsersModalContext = createContext<InviteUsersModalContextProps | undefined>(undefined)

export function useInviteUsersModal() {
  const context = useContext(InviteUsersModalContext)
  if (!context) {
    throw new Error("useInviteUsersModal must be used within a InviteUsersModalProvider")
  }

  return context
}

interface InviteUsersModalProviderProps {
  children: ReactNode
}

export function InviteUsersModalProvider({ children }: InviteUsersModalProviderProps) {
  const [open, setOpen] = useState(false)

  return <InviteUsersModalContext.Provider value={{ open, setOpen }}>{children}</InviteUsersModalContext.Provider>
}
