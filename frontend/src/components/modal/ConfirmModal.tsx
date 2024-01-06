import { Dispatch, FC, Fragment, SetStateAction } from "react"

import { Modal } from "./Modal"
import { Transition } from "@headlessui/react"

export interface ConfirmModalProps {
  title?: string
  message?: string
  primaryButtonLabel?: string
  cancelButtonLabel?: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onClose: (retValue: boolean) => void
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  title = "Er du sikker?",
  message = "Er du sikker på at du ønsker å gjøre dette?",
  primaryButtonLabel = "Ja",
  cancelButtonLabel = "Nei",
  onClose,
  open,
  setOpen,
}) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        setOpen={setOpen}
        onClose={() => onClose(false)}
        title={title}
        description={message}
        type="ERROR"
        primaryButtonLabel={primaryButtonLabel}
        primaryButtonAction={() => {
          onClose(true)
          return true
        }}
        cancelButtonLabel={cancelButtonLabel}
        cancelButtonAction={() => onClose(false)}
      />
    </Transition.Root>
  )
}
