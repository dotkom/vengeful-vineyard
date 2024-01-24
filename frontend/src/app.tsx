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

const configuration: AuthProviderProps = {
  client_id: "ksPx08as8bc9jCaRvG8R2Gte1twJChTuHbfVG0My",
  redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:3000",
  scope: "openid profile email online",
  authority: "https://old.online.ntnu.no/sso/",
  metadataUrl: "https://old.online.ntnu.no/sso/.well-known/openid-configuration/",
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
