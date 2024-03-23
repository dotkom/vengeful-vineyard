import "./index.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WebStorageStateStore } from "oidc-client-ts"
import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider, AuthProviderProps } from "react-oidc-context"
import { onSigninCallback } from "./helpers/auth"
import AuthRouterProvider from "./AuthRouterProvider"
import { TogglePunishmentsProvider } from "./helpers/context/togglePunishmentsContext"
import ModalProvider from "./views/groups/modal/AllModalProvider"
import { GroupNavigationProvider } from "./helpers/context/groupNavigationContext"
import { MyGroupsRefetchProvider } from "./helpers/context/myGroupsRefetchContext"
import { ConfirmModalProvider } from "./helpers/context/modal/confirmModalContext"

const queryClient = new QueryClient()

const configuration: AuthProviderProps = {
  client_id: import.meta.env.AUTH0_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  scope: "openid profile email",
  authority: import.meta.env.AUTH0_ISSUER,
  metadataUrl: `${import.meta.env.AUTH0_ISSUER}/.well-known/openid-configuration`,
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
  revokeTokensOnSignout: true,
  post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  onSigninCallback: onSigninCallback,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider {...configuration}>
      <ModalProvider>
        <MyGroupsRefetchProvider>
          <GroupNavigationProvider>
            <TogglePunishmentsProvider>
              <ConfirmModalProvider>
                <QueryClientProvider client={queryClient}>
                  <AuthRouterProvider />
                </QueryClientProvider>
              </ConfirmModalProvider>
            </TogglePunishmentsProvider>
          </GroupNavigationProvider>
        </MyGroupsRefetchProvider>
      </ModalProvider>
    </AuthProvider>
  </React.StrictMode>
)
