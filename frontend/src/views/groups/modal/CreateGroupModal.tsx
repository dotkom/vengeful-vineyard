import { ChangeEvent, Dispatch, FC, Fragment, SetStateAction, useRef, useState } from "react"

import { Modal } from "../../../components/modal"
import { TextInput } from "../../../components/input/TextInput"
import { Transition } from "@headlessui/react"
import axios from "axios"
import { VengefulApiError, getPostGroupUrl } from "../../../helpers/api"
import { useErrorControl } from "../../../helpers/form"
import { useMutation } from "@tanstack/react-query"
import { useMyGroupsRefetch } from "../../../helpers/context/myGroupsRefetchContext"
import { useNotification } from "../../../helpers/context/notificationContext"
import { z } from "zod"
import { useNavigate } from "react-router-dom"

interface CreateGroupModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const GroupCreate = z.object({
  name: z.string().min(3, { message: "Navn må være minst tre tegn" }),
  name_short: z.string().min(3, { message: "Kort navn må være minst tre tegn" }),
})

type GroupCreateType = z.infer<typeof GroupCreate>

export const CreateGroupModal: FC<CreateGroupModalProps> = ({ open, setOpen }) => {
  const ref = useRef(null)
  const { setNotification } = useNotification()
  const { myGroupsRefetch } = useMyGroupsRefetch()

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

  const navigate = useNavigate()

  const handleCreateClicked = (): boolean => {
    const data = GroupCreate.safeParse(createGroupData)
    setErrors(data)

    if (!data.success) return false

    createGroupMutate()
    return true
  }

  const { mutate: createGroupMutate } = useMutation(async () => await axios.post(getPostGroupUrl(), createGroupData), {
    onSuccess: async () => {
      if (myGroupsRefetch) {
        await myGroupsRefetch()
        navigate(`/gruppe/${createGroupData.name_short}`)
      }
      setCreateGroupData({
        name: "",
        name_short: "",
      })
      setNotification({
        type: "success",
        title: "Gruppe opprettet",
        text: "Gruppen ble opprettet",
      })
    },
    onError: (e: VengefulApiError) => {
      setNotification({
        type: "error",
        title: "Kunne ikke opprette gruppen",
        text: e.response.data.detail,
      })
    },
  })

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
