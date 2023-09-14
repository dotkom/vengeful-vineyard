import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import "./index.css";
import { onSigninCallback } from "./helpers/auth";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

const queryClient = new QueryClient();

const configuration = {
  client_id: "219919",
  redirect_uri: "http://localhost:3000",
  scope: "openid profile onlineweb4",
  authority: "https://old.online.ntnu.no/openid",
  metadataUrl:
    "https://old.online.ntnu.no/openid/.well-known/openid-configuration",
  silent_redirect_uri: "http://localhost:3000",
  filterProtocolClaims: true,
  loadUserInfo: true,
  revokeTokensOnSignout: true,
  post_logout_redirect_uri: "http://localhost:3000",
  onSigninCallback: onSigninCallback,
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider {...configuration}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);
