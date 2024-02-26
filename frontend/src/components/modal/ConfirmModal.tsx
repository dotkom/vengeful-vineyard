import { YesNoConfirmModal } from "./YesNoConfirmModal"
import { InputConfirmModal } from "./InputConfirmModal"
import { useConfirmModal } from "../../helpers/context/modal/confirmModalContext"

export default function ConfirmModal() {
  const confirmModal = useConfirmModal()

  return confirmModal.type === "YESNO" ? (
    <YesNoConfirmModal open={confirmModal.open} setOpen={confirmModal.setOpen} {...confirmModal.options} />
  ) : (
    <InputConfirmModal open={confirmModal.open} setOpen={confirmModal.setOpen} {...confirmModal.options} />
  )
}
