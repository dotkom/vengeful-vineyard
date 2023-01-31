import { User } from "oidc-client-ts";

export const onSigninCallback = (_user: User | void): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};
