import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react"

import { ConfirmModalProps } from "../../../components/modal/YesNoConfirmModal"
import { InputConfirmModalProps } from "../../../components/modal/InputConfirmModal"

type ConfirmModalType = "YESNO" | "INPUT"
type ConfirmModalOptions = (
  | Partial<Omit<ConfirmModalProps, "open" | "setOpen" | "onClose">>
  | Partial<Omit<InputConfirmModalProps, "open" | "setOpen" | "onClose">>
) &
  Pick<ConfirmModalProps | InputConfirmModalProps, "onClose">

interface ConfirmModalContextProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  type: ConfirmModalType
  setType: Dispatch<SetStateAction<ConfirmModalType>>
  options: ConfirmModalOptions
  setOptions: Dispatch<SetStateAction<ConfirmModalOptions>>
}

const ConfirmModalContext = createContext<ConfirmModalContextProps | undefined>(undefined)

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext)
  if (!context) {
    throw new Error("useConfirmModal must be used within a ConfirmModalProvider")
  }

  return context
}

interface ConfirmModalProviderProps {
  children: ReactNode
}

export function ConfirmModalProvider({ children }: ConfirmModalProviderProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<ConfirmModalType>("YESNO")
  const [options, setOptions] = useState<ConfirmModalOptions>({
    onClose: () => {},
  })

  const customSetOpen = (newState: SetStateAction<boolean>) => {
    if (open === true && newState === true) {
      throw new Error("Confirm modal is already being used")
    }

    setOpen(newState)
  }

  return (
    <ConfirmModalContext.Provider value={{ open, setOpen: customSetOpen, type, setType, options, setOptions }}>
      {children}
    </ConfirmModalContext.Provider>
  )
}
