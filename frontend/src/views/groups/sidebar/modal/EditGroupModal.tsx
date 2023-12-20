import { Dispatch, FC, Fragment, SetStateAction, useRef } from "react"

import { Modal } from "../../../../components/modal"
import { Transition } from "@headlessui/react"

interface EditGroupModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const EditGroupModal: FC<EditGroupModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Rediger gruppe"
        setOpen={setOpen}
        primaryButtonLabel="Rediger"
        primaryButtonAction={() => true}
      >
        <p className="text-sm text-gray-500">Her kan redigere en gruppe</p>
        <div className="mb-4 flex flex-col gap-2 font-normal"></div>
      </Modal>
    </Transition.Root>
  )
}
