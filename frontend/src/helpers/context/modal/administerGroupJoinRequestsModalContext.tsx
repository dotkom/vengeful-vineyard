import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

interface AdministerGroupJoinRequestsModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const AdministerGroupJoinRequestsModalContext = createContext<AdministerGroupJoinRequestsModalContextProps | undefined>(
  undefined
)

export function useAdministerGroupJoinRequestsModal() {
  const context = useContext(AdministerGroupJoinRequestsModalContext)
  if (!context) {
    throw new Error(
      "useAdministerGroupJoinRequestsModal must be used within a AdministerGroupJoinRequestsModalProvider"
    )
  }

  return context
}

interface AdministerGroupJoinRequestsModalProviderProps {
  children: ReactNode
}

export function AdministerGroupJoinRequestsModalProvider({ children }: AdministerGroupJoinRequestsModalProviderProps) {
  const [open, setOpen] = useState(false)

  return (
    <AdministerGroupJoinRequestsModalContext.Provider value={{ open, setOpen }}>
      {children}
    </AdministerGroupJoinRequestsModalContext.Provider>
  )
}
