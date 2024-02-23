import "./index.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WebStorageStateStore } from "oidc-client-ts"
import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider, AuthProviderProps } from "react-oidc-context"
import { onSigninCallback } from "./helpers/auth"
import AuthRouterProvider from "./AuthRouterProvider"
import { envSchema } from "../env"
import { TogglePunishmentsProvider } from "./helpers/context/togglePunishmentsContext"
import ModalProvider from "./views/groups/modal/AllModalProvider"
import { GroupNavigationProvider } from "./helpers/context/groupNavigationContext"
import { MyGroupsRefetchProvider } from "./helpers/context/myGroupsRefetchContext"

envSchema.parse(import.meta.env)

const queryClient = new QueryClient()

const configuration: AuthProviderProps = {
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  scope: "openid profile email online",
  authority: import.meta.env.VITE_TOKEN_ISSUER,
  metadataUrl: `${import.meta.env.VITE_TOKEN_ISSUER}/.well-known/openid-configuration`,
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
              <QueryClientProvider client={queryClient}>
                <AuthRouterProvider />
              </QueryClientProvider>
            </TogglePunishmentsProvider>
          </GroupNavigationProvider>
        </MyGroupsRefetchProvider>
      </ModalProvider>
    </AuthProvider>
  </React.StrictMode>
)
