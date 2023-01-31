import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import "./index.css";

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
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider {...configuration}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
