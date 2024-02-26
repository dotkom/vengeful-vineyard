import { GivePunishmentModalProvider } from "../../../helpers/context/modal/givePunishmentModalContext"
import { CreateGroupModalProvider } from "../../../helpers/context/modal/createGroupModalContext"
import { RequestToJoinGroupModalProvider } from "../../../helpers/context/modal/requestToJoinGroupModalContext"
import { EditGroupModalProvider } from "../../../helpers/context/modal/editGroupModalContext"
import { AdministerGroupJoinRequestsModalProvider } from "../../../helpers/context/modal/administerGroupJoinRequestsModalContext"
import { EditGroupMembersModalProvider } from "../../../helpers/context/modal/editGroupMembersModalContext"
import { ConfirmModalProvider } from "../../../helpers/context/modal/confirmModalContext"

import React from "react"

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <GivePunishmentModalProvider>
      <CreateGroupModalProvider>
        <RequestToJoinGroupModalProvider>
          <EditGroupModalProvider>
            <EditGroupMembersModalProvider>
              <AdministerGroupJoinRequestsModalProvider>{children}</AdministerGroupJoinRequestsModalProvider>
            </EditGroupMembersModalProvider>
          </EditGroupModalProvider>
        </RequestToJoinGroupModalProvider>
      </CreateGroupModalProvider>
    </GivePunishmentModalProvider>
  )
}
