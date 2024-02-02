import { ConfirmModal } from "../../components/modal/ConfirmModal"
import { CreateGroupModalProvider } from "../../helpers/context/modal/createGroupModalContext"
import { DefaultHero } from "../../views/hero"
import { EditGroupMembersModalProvider } from "../../helpers/context/modal/editGroupMembersModalContext"
import { EditGroupModalProvider } from "../../helpers/context/modal/editGroupModalContext"
import { GivePunishmentModalProvider } from "../../helpers/context/modal/givePunishmentModalContext"
import { GroupsView } from "../../views/groups"
import { InputConfirmModal } from "../../components/modal/InputConfirmModal"
import { MyGroupsRefetchProvider } from "../../helpers/context/myGroupsRefetchContext"
import { TogglePunishmentsProvider } from "../../helpers/context/togglePunishmentsContext"
import { useAuth } from "react-oidc-context"
import { useConfirmModal } from "../../helpers/context/modal/confirmModalContext"
import { GroupNavigationProvider } from "../../helpers/context/groupNavigationContext"
import { InviteUsersModalProvider } from "../../helpers/context/modal/inviteUsersModalContext"

export const Home = () => {
  const auth = useAuth()
  const confirmModal = useConfirmModal()

  return (
    <>
      {confirmModal.type === "YESNO" ? (
        <ConfirmModal open={confirmModal.open} setOpen={confirmModal.setOpen} {...confirmModal.options} />
      ) : (
        <InputConfirmModal open={confirmModal.open} setOpen={confirmModal.setOpen} {...confirmModal.options} />
      )}
      {auth.isAuthenticated ? (
        <MyGroupsRefetchProvider>
          <GroupNavigationProvider>
            <GivePunishmentModalProvider>
              <TogglePunishmentsProvider>
                <CreateGroupModalProvider>
                  <EditGroupModalProvider>
                    <EditGroupMembersModalProvider>
                      <InviteUsersModalProvider>
                        <GroupsView />
                      </InviteUsersModalProvider>
                    </EditGroupMembersModalProvider>
                  </EditGroupModalProvider>
                </CreateGroupModalProvider>
              </TogglePunishmentsProvider>
            </GivePunishmentModalProvider>
          </GroupNavigationProvider>
        </MyGroupsRefetchProvider>
      ) : (
        <DefaultHero auth={auth} />
      )}
    </>
  )
}
