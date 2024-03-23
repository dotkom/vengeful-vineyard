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
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom"
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.SENTRY_FRONTEND_DSN,
  environment: import.meta.env.SENTRY_ENVIRONMENT,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 1.0,

  tracePropagationTargets: ["localhost", "api.staging.vinstraff.no", "api.vinstraff.no"],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

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
