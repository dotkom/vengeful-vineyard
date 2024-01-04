import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface EditGroupModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const EditGroupModalContext = createContext<EditGroupModalContextProps | undefined>(undefined)

export function useEditGroupModal() {
  const context = useContext(EditGroupModalContext)
  if (!context) {
    throw new Error("useEditGroupModal must be used within a EditGroupModalProvider")
  }

  return context
}

interface EditGroupModalProviderProps {
  children: ReactNode
}

export function EditGroupModalProvider({ children }: EditGroupModalProviderProps) {
  const [open, setOpen] = useState(false)

  return <EditGroupModalContext.Provider value={{ open, setOpen }}>{children}</EditGroupModalContext.Provider>
}
