import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface CreateGroupModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CreateGroupModalContext = createContext<CreateGroupModalContextProps | undefined>(undefined)

export function useCreateGroupModal() {
  const context = useContext(CreateGroupModalContext)
  if (!context) {
    throw new Error("useCreateGroupModal must be used within a CreateGroupModalProvider")
  }

  return context
}

interface CreateGroupModalProviderProps {
  children: ReactNode
}

export function CreateGroupModalProvider({ children }: CreateGroupModalProviderProps) {
  const [open, setOpen] = useState(false)

  return <CreateGroupModalContext.Provider value={{ open, setOpen }}>{children}</CreateGroupModalContext.Provider>
}
