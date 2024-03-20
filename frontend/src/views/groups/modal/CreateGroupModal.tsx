import { ChangeEvent, Dispatch, FC, Fragment, SetStateAction, useRef, useState } from "react"

import { Modal } from "../../../components/modal"
import { TextInput } from "../../../components/input/TextInput"
import { Transition } from "@headlessui/react"
import { useErrorControl } from "../../../helpers/form"
import { useMutation } from "@tanstack/react-query"
import { GroupCreate, GroupCreateType } from "../../../helpers/types"
import { postGroupMutation } from "../../../helpers/api"

interface CreateGroupModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const CreateGroupModal: FC<CreateGroupModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)

  const [createGroupData, setCreateGroupData] = useState<GroupCreateType>({
    name: "",
    name_short: "",
  })

  const [errors, setErrors] = useErrorControl(GroupCreate)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCreateGroupData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCreateClicked = (): boolean => {
    const data = GroupCreate.safeParse(createGroupData)
    setErrors(data)

    if (!data.success) return false

    createGroupMutation()
    return true
  }

  const { mutate: createGroupMutation } = useMutation(postGroupMutation(createGroupData))

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Opprett gruppe"
        description="Her kan du opprette en gruppe"
        setOpen={setOpen}
        primaryButtonLabel="Opprett"
        primaryButtonAction={handleCreateClicked}
      >
        <div className="mb-4 md:mt-4 flex flex-col gap-6 font-normal">
          <TextInput
            label="Navn"
            name="name"
            placeholder="Skriv inn et navn"
            value={createGroupData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <TextInput
            label="Kort navn"
            name="name_short"
            placeholder="Skriv inn et navn"
            value={createGroupData.name_short}
            onChange={handleChange}
            error={errors.name_short}
          />
        </div>
      </Modal>
    </Transition.Root>
  )
}
