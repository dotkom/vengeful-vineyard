import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

import { GroupUser } from "../../types"

interface EditGroupMembersModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  preferredSelectedPerson: GroupUser | undefined
  setPreferredSelectedPerson: Dispatch<SetStateAction<GroupUser | undefined>>
}

const EditGroupMembersModalContext = createContext<EditGroupMembersModalContextProps | undefined>(undefined)

export function useEditGroupMembersModal() {
  const context = useContext(EditGroupMembersModalContext)
  if (!context) {
    throw new Error("useEditGroupMembersModal must be used within a EditGroupMembersModalProvider")
  }

  return context
}

interface EditGroupMembersModalProviderProps {
  children: ReactNode
}

export function EditGroupMembersModalProvider({ children }: EditGroupMembersModalProviderProps) {
  const [open, setOpen] = useState(false)
  const [preferredSelectedPerson, setPreferredSelectedPerson] = useState<GroupUser | undefined>(undefined)

  return (
    <EditGroupMembersModalContext.Provider
      value={{ open, setOpen, preferredSelectedPerson, setPreferredSelectedPerson }}
    >
      {children}
    </EditGroupMembersModalContext.Provider>
  )
}
