import "./index.css"

import { AuthProvider, AuthProviderProps } from "react-oidc-context"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { WebStorageStateStore } from "oidc-client-ts"
import { onSigninCallback } from "./helpers/auth"
import { router } from "./routes"

const queryClient = new QueryClient()

const configuration: AuthProviderProps = {
  client_id: "219919",
  redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:3000",
  scope: "openid profile onlineweb4",
  authority: "https://old.online.ntnu.no/openid",
  metadataUrl: "https://old.online.ntnu.no/openid/.well-known/openid-configuration",
  silent_redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:3000",
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
