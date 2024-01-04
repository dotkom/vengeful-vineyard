import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface RequestToJoinGroupModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const RequestToJoinGroupModalContext = createContext<RequestToJoinGroupModalContextProps | undefined>(undefined)

export function useRequestToJoinGroupModal() {
  const context = useContext(RequestToJoinGroupModalContext)
  if (!context) {
    throw new Error("useRequestToJoinGroupModal must be used within a RequestToJoinGroupModalProvider")
  }

  return context
}

interface RequestToJoinGroupModalProviderProps {
  children: ReactNode
}

export function RequestToJoinGroupModalProvider({ children }: RequestToJoinGroupModalProviderProps) {
  const [open, setOpen] = useState(false)

  return (
    <RequestToJoinGroupModalContext.Provider value={{ open, setOpen }}>
      {children}
    </RequestToJoinGroupModalContext.Provider>
  )
}
