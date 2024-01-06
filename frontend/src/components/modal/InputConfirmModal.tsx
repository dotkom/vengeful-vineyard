import { Dispatch, FC, Fragment, SetStateAction, useEffect, useState } from "react"

import { Modal } from "./Modal"
import { TextInput } from "../input/TextInput"
import { Transition } from "@headlessui/react"

export interface InputConfirmModalProps {
  title?: string
  message?: string
  inputKeyword?: string
  primaryButtonLabel?: string
  cancelButtonLabel?: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onClose: (retValue: boolean) => void
}

export const InputConfirmModal: FC<InputConfirmModalProps> = ({
  title = "Er du sikker?",
  message,
  inputKeyword = "Godkjenn",
  primaryButtonLabel = "Ja",
  cancelButtonLabel = "Nei",
  onClose,
  open,
  setOpen,
}) => {
  if (!message)
    message = `Dersom du er sikker på at du ønsker å gjøre dette, skriv inn **${inputKeyword}** i feltet under og trykk **${primaryButtonLabel}**.`

  const [input, setInput] = useState("")

  useEffect(() => {
    setInput("")
  }, [open])

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
        primaryButtonDisabled={input !== inputKeyword}
      >
        <div className="pt-4">
          <TextInput value={input} placeholder="Skriv inn her" onChange={(e) => setInput(e.target.value)} />
        </div>
      </Modal>
    </Transition.Root>
  )
}
