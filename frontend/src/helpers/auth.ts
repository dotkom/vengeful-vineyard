import { User } from "oidc-client-ts"
import { NavigateFunction, Location } from "react-router-dom"
import { AuthContextProps } from "react-oidc-context"

export const signinAndReturn = async (auth: AuthContextProps, location: Location) => {
  sessionStorage.setItem("postLoginRedirect", location.pathname)
  await auth.signinRedirect()
}

export const checkSigninRedirect = (navigate: NavigateFunction) => {
  const postLoginRedirect = sessionStorage.getItem("postLoginRedirect")

  if (postLoginRedirect) {
    sessionStorage.removeItem("postLoginRedirect")
    navigate(postLoginRedirect)
  }
}

export const onSigninCallback = (_user?: User | void) => {
  const url = new URL(window.location.href)
  url.search = ""
  window.history.replaceState({}, document.title, url.toString())
}
