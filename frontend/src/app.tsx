import "./index.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WebStorageStateStore } from "oidc-client-ts"
import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider, AuthProviderProps } from "react-oidc-context"
import { RouterProvider } from "react-router-dom"
import { onSigninCallback } from "./helpers/auth"
import { router } from "./routes"

const queryClient = new QueryClient()

const scopes = [
  "authentication.onlineuser.username.read",
  "authentication.onlineuser.first_name.read",
  "authentication.onlineuser.last_name.read",
  "authentication.onlineuser.email.read",
  "authentication.onlineuser.is_member.read",
  "authentication.onlineuser.is_staff.read",
  "authentication.onlineuser.is_superuser.read",
  "authentication.onlineuser.field_of_study.read",
  "authentication.onlineuser.nickname.read",
  "authentication.onlineuser.rfid.read",
]

const configuration: AuthProviderProps = {
  client_id: "ksPx08as8bc9jCaRvG8R2Gte1twJChTuHbfVG0My",
  redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:3000",
  scope: scopes.join(" "),
  authority: "https://old.online.ntnu.no/sso/",
  metadata: {
    authorization_endpoint: "https://old.online.ntnu.no/sso/authorize/",
    token_endpoint: "https://old.online.ntnu.no/api/v1/auth/",
    userinfo_endpoint: "https://old.online.ntnu.no/sso/user/",
  },
  silent_redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:3000",
  automaticSilentRenew: true,
  filterProtocolClaims: true,
  loadUserInfo: true,
  revokeTokensOnSignout: true,
  post_logout_redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:3000",
  onSigninCallback: onSigninCallback,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider {...configuration}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
)
