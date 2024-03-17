import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, Dispatch, FC, Fragment, SetStateAction, useRef, useState } from "react"
import {
  VengefulApiError,
  getDeletePunishmentTypeUrl,
  getPostPunishmentTypeUrl,
  getPutGroupUrl,
  getPutPunishmentTypeUrl,
  groupLeaderboardQuery,
} from "../../../helpers/api"

import { Transition } from "@headlessui/react"
import axios from "axios"
import { z } from "zod"
import { Button } from "../../../components/button"
import { NumberInput } from "../../../components/input/NumberInput"
import { TextInput } from "../../../components/input/TextInput"
import { Listbox } from "../../../components/listbox/Listbox"
import { Modal } from "../../../components/modal"
import { Spinner } from "../../../components/spinner"
import { Tabs } from "../../../components/tabs/Tabs"
import { useNotification } from "../../../helpers/context/notificationContext"
import { useErrorControl } from "../../../helpers/form"
import { PunishmentType } from "../../../helpers/types"
import { areObjectsEqual } from "../../../helpers/utils"
import { useGroupNavigation } from "../../../helpers/context/groupNavigationContext"
import { useMyGroupsRefetch } from "../../../helpers/context/myGroupsRefetchContext"
import { useNavigate } from "react-router-dom"

interface EditGroupModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const EditGroup = z.object({
  name: z.string().trim().min(3, { message: "Navn må være minst tre tegn" }),
  name_short: z.string().trim().min(3, { message: "Kort navn må være minst tre tegn" }),
})

type EditGroupType = z.infer<typeof EditGroup>

const MutatePunishmentType = z.object({
  name: z.string().trim().min(3, { message: "Navn må være minst tre tegn" }),
  emoji: z.string().trim().min(1, { message: "Emoji må være minst ett tegn" }),
  value: z.number().min(1, { message: "Verdi må være minst 1" }),
})

type MutatePunishmentTypeType = z.infer<typeof MutatePunishmentType>

const baseEditGroupData = {
  name: "",
  name_short: "",
}

const baseCreatePunishmentTypeData = {
  name: "",
  emoji: "",
  value: 0,
}

const baseEditPunishmentTypeData = {
  name: "",
  emoji: "",
  value: 0,
}

export const EditGroupModal: FC<EditGroupModalProps> = ({ open, setOpen }) => {
  const { selectedGroup } = useGroupNavigation()
  const { myGroupsRefetch } = useMyGroupsRefetch()
  const { setNotification } = useNotification()
  const queryClient = useQueryClient()
  const ref = useRef(null)

  const [editGroupData, setEditGroupData] = useState<EditGroupType>({ ...baseEditGroupData })
  const [initialEditGropuData, setInitialEditGroupData] = useState<EditGroupType>({ ...baseEditGroupData })
  const [createPunishmentTypeData, setCreatePunishmentTypeData] = useState<MutatePunishmentTypeType>({
    ...baseCreatePunishmentTypeData,
  })
  const [editPunishmentTypeData, setEditPunishmentTypeData] = useState<MutatePunishmentTypeType>({
    ...baseEditPunishmentTypeData,
  })
  const [initialEditPunishmentTypeData, setInitialEditPunishmentTypeData] = useState<MutatePunishmentTypeType>({
    ...baseEditPunishmentTypeData,
  })

  const [currentPunishmentType, setCurrentPunishmentType] = useState<PunishmentType | undefined>(undefined)

  const [editGroupErrors, setEditGroupErrors] = useErrorControl(EditGroup)
  const [mutatePunishmentTypeErrors, setMutatePunishmentTypeErrors] = useErrorControl(MutatePunishmentType)

  const navigate = useNavigate()

  const { data: groupData, isLoading } = useQuery({
    onSuccess: (group) => {
      setEditGroupData({ name: group.name, name_short: group.name_short })
      setInitialEditGroupData({ name: group.name, name_short: group.name_short })

      const punishmentType = group.punishment_types[Object.keys(group.punishment_types)[0]]
      setCurrentPunishmentType(punishmentType)

      const newEditPunishmentTypeData = {
        name: punishmentType?.name ?? "",
        emoji: punishmentType?.emoji ?? "",
        value: punishmentType?.value ?? 0,
      }
      setEditPunishmentTypeData({ ...newEditPunishmentTypeData })
      setInitialEditPunishmentTypeData({ ...newEditPunishmentTypeData })
    },
    ...groupLeaderboardQuery(selectedGroup?.group_id),
  })

  const selectedGroupId = selectedGroup?.group_id ?? ""
  const punishmentTypeOptions = Object.values(groupData?.punishment_types ?? []).map((pt) => ({
    value: pt.punishment_type_id,
    label: pt.name,
  }))

  // Change handlers

  const nameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEditGroupData({ ...editGroupData, name: e.target.value })
  }

  const shortNameChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEditGroupData({ ...editGroupData, name_short: e.target.value })
  }

  const currentPunishmentTypeChangeHandler: SetStateAction<string> = (punishmentTypeId: string): string => {
    const punishmentType = groupData?.punishment_types[punishmentTypeId]
    setCurrentPunishmentType(punishmentType)
    setInitialEditPunishmentTypeData({
      ...initialEditPunishmentTypeData,
      ...punishmentType,
    })
    setEditPunishmentTypeData({
      ...editPunishmentTypeData,
      ...punishmentType,
    })

    return punishmentTypeId
  }

  const punishmentTypeNameChangeHandler = (mode: "CREATE" | "EDIT", e: ChangeEvent<HTMLInputElement>) => {
    if (mode === "CREATE") setCreatePunishmentTypeData({ ...createPunishmentTypeData, name: e.target.value })
    else setEditPunishmentTypeData({ ...editPunishmentTypeData, name: e.target.value })
  }

  const punishmentTypeEmojiChangeHandler = (mode: "CREATE" | "EDIT", e: ChangeEvent<HTMLInputElement>) => {
    if (mode === "CREATE") setCreatePunishmentTypeData({ ...createPunishmentTypeData, emoji: e.target.value })
    else setEditPunishmentTypeData({ ...editPunishmentTypeData, emoji: e.target.value })
  }

  const punishmentTypeValueChangeHandler = (mode: "CREATE" | "EDIT", e: ChangeEvent<HTMLInputElement>) => {
    if (mode === "CREATE") setCreatePunishmentTypeData({ ...createPunishmentTypeData, value: parseInt(e.target.value) })
    else setEditPunishmentTypeData({ ...editPunishmentTypeData, value: parseInt(e.target.value) })
  }

  // Click handlers

  const editButtonClickHandler = (): boolean => {
    const data = EditGroup.safeParse(editGroupData)
    setEditGroupErrors(data)

    if (!data.success) return false

    editGroupMutate()
    return true
  }

  const createPunishmentTypeClickHandler = () => {
    const data = MutatePunishmentType.safeParse(createPunishmentTypeData)
    setMutatePunishmentTypeErrors(data)

    if (!data.success) return false

    createPunishmentTypeMutate()
    return true
  }

  const editPunishmentTypeClickHandler = () => {
    const data = MutatePunishmentType.safeParse(editPunishmentTypeData)
    setMutatePunishmentTypeErrors(data)

    if (!data.success) return false

    editPunishmentTypeMutate()
    return true
  }

  const deletePunishmentTypeClickHandler = () => {
    deletePunishmentTypeMutate()
  }

  // Mutations

  const { mutate: editGroupMutate } = useMutation(
    async () => await axios.patch(getPutGroupUrl(selectedGroupId), editGroupData),
    {
      onSuccess: () => {
        myGroupsRefetch!().then(() => navigate(`/gruppe/${editGroupData.name_short}`))
        setNotification({
          type: "success",
          title: "Suksess",
          text: "Gruppen ble redigert",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke redigere gruppen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: createPunishmentTypeMutate } = useMutation(
    () => axios.post(getPostPunishmentTypeUrl(selectedGroupId), createPunishmentTypeData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroupId] })
        setNotification({
          type: "success",
          title: "Suksess",
          text: "Straffetypen ble opprettet",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke opprette straffetypen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: editPunishmentTypeMutate } = useMutation(
    () =>
      axios.patch(
        getPutPunishmentTypeUrl(selectedGroupId, currentPunishmentType?.punishment_type_id ?? ""),
        editPunishmentTypeData
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroupId] })
        setNotification({
          type: "success",
          title: "Suksess",
          text: "Straffetypen ble redigert",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke redigere straffetypen",
          text: e.response.data.detail,
        })
      },
    }
  )

  const { mutate: deletePunishmentTypeMutate } = useMutation(
    () => axios.delete(getDeletePunishmentTypeUrl(selectedGroupId, currentPunishmentType?.punishment_type_id ?? "")),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groupLeaderboard", selectedGroupId] })
        setNotification({
          type: "success",
          title: "Suksess",
          text: "Straffetypen ble slettet",
        })
      },
      onError: (e: VengefulApiError) => {
        setNotification({
          type: "error",
          title: "Kunne ikke slette straffetypen",
          text: e.response.data.detail,
        })
      },
    }
  )

  // Render

  const getPunishmentTypeTabContent = (mode: "CREATE" | "EDIT"): JSX.Element => {
    return (
      <div className="flex flex-col gap-y-4 mt-4 border-l-2 border-l-gray-500/50 pl-3">
        {mode === "EDIT" && (
          <Listbox
            label="Velg straffetype"
            options={punishmentTypeOptions ?? []}
            value={currentPunishmentType?.punishment_type_id ?? ""}
            onChange={currentPunishmentTypeChangeHandler}
          />
        )}
        <div className="flex flex-col gap-y-3 w-full border-none border-l-gray-500/50">
          <TextInput
            label="Navn"
            placeholder="Skriv inn et navn"
            value={mode === "CREATE" ? createPunishmentTypeData.name : editPunishmentTypeData.name}
            error={mutatePunishmentTypeErrors.name}
            onChange={(e) => punishmentTypeNameChangeHandler(mode, e)}
          />
          <TextInput
            label="Emoji"
            placeholder="Skriv inn en emoji"
            value={mode === "CREATE" ? createPunishmentTypeData.emoji : editPunishmentTypeData.emoji}
            error={mutatePunishmentTypeErrors.emoji}
            onChange={(e) => punishmentTypeEmojiChangeHandler(mode, e)}
          />
          <NumberInput
            label="Verdi"
            value={mode === "CREATE" ? createPunishmentTypeData.value : editPunishmentTypeData.value}
            error={mutatePunishmentTypeErrors.value}
            onChange={(e) => punishmentTypeValueChangeHandler(mode, e)}
            min={1}
          />

          <div className="flex flex-col gap-y-1">
            {mode === "CREATE" ? (
              <Button
                variant="OUTLINE"
                label="Opprett straffetype"
                color="BLUE"
                onClick={createPunishmentTypeClickHandler}
                disabled={areObjectsEqual(createPunishmentTypeData, baseCreatePunishmentTypeData)}
                className="mt-1"
              />
            ) : (
              <>
                <Button
                  variant="OUTLINE"
                  label="Rediger straffetype"
                  color="BLUE"
                  onClick={editPunishmentTypeClickHandler}
                  disabled={areObjectsEqual(editPunishmentTypeData, initialEditPunishmentTypeData)}
                  className="mt-1"
                />
                <Button
                  variant="OUTLINE"
                  label="Slett straffetype"
                  color="RED"
                  onClick={deletePunishmentTypeClickHandler}
                  className="mt-1"
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Modal
        ref={ref}
        title="Rediger gruppe"
        description="Her kan du redigere en gruppe"
        setOpen={setOpen}
        primaryButtonLabel="Rediger"
        primaryButtonAction={editButtonClickHandler}
        primaryButtonDisabled={areObjectsEqual(editGroupData, initialEditGropuData)}
      >
        <div className="mb-4 md:mt-2 flex flex-col gap-6 font-normal">
          {!groupData || isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="w-64"></div>

              <TextInput
                label="Gruppenavn"
                placeholder="Skriv inn et gruppenavn"
                value={editGroupData.name}
                error={editGroupErrors.name}
                onChange={nameChangeHandler}
                disabled={selectedGroup?.ow_group_id !== null}
              />
              <TextInput
                label="Kort gruppenavn"
                placeholder="Skriv inn et kort gruppenavn"
                value={editGroupData.name_short}
                error={editGroupErrors.name_short}
                onChange={shortNameChangeHandler}
                disabled={selectedGroup?.ow_group_id !== null}
              />

              <div className="flex flex-col gap-y-4">
                <Tabs
                  label="Straffetyper"
                  categories={[
                    { label: "Opprett", content: getPunishmentTypeTabContent("CREATE") },
                    { label: "Rediger", content: getPunishmentTypeTabContent("EDIT") },
                  ]}
                  onChange={() => {
                    setMutatePunishmentTypeErrors({})
                  }}
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </Transition.Root>
  )
}
