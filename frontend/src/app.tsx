import "./index.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WebStorageStateStore } from "oidc-client-ts"
import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider, AuthProviderProps } from "react-oidc-context"
import { RouterProvider } from "react-router-dom"
import { onSigninCallback } from "./helpers/auth"
import { router } from "./routes"
import { envSchema } from "../env"

envSchema.parse(import.meta.env)

const queryClient = new QueryClient()

const configuration: AuthProviderProps = {
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  scope: "openid profile email online",
  authority: import.meta.env.VITE_TOKEN_ISSUER,
  metadataUrl: `${import.meta.env.VITE_TOKEN_ISSUER}/.well-known/openid-configuration`,
  // silent_redirect_uri: import.meta.env.VITE_REDIRECT_URI,
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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
)
