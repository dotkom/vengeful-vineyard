import axios from "axios"
import { useAuth } from "react-oidc-context"
import { Outlet, useNavigate } from "react-router-dom"
import { Footer } from "../../components/footer"
import { Nav } from "../../components/nav"
import { Notification } from "../../components/notification"
import { Spinner } from "../../components/spinner"
import { CurrentUserProvider } from "../../helpers/context/currentUserContext"
import { ConfirmModalProvider } from "../../helpers/context/modal/confirmModalContext"
import { NotificationProvider } from "../../helpers/context/notificationContext"
import { DarkModeProvider } from "../../DarkModeContext"
import React, { useEffect } from "react"
import ConfirmModal from "../../components/modal/ConfirmModal"
import { checkSigninRedirect } from "../../helpers/auth"

export const Layout: React.FC = () => {
  return (
    <DarkModeProvider>
      <ConfirmModal />
      <LayoutFields />
    </DarkModeProvider>
  )
}

const LayoutFields = () => {
  const navigate = useNavigate()
  const auth = useAuth()

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>
    case "signoutRedirect":
      return <div>Signing you out...</div>
  }

  useEffect(() => checkSigninRedirect(navigate), [])

  if (auth.isLoading) {
    return (
      <>
        <main className="flex h-screen flex-col bg-gray-50">
          <Nav auth={auth} />
          <div className="flex justify-center mt-16">
            <Spinner />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (auth.error) {
    if (
      auth.error.message === "No matching state found in storage" ||
      auth.error.message.startsWith("The provided authorization grant or refresh token is invalid, expired") ||
      auth.error.message === "invalid_grant"
    ) {
      auth.signinRedirect().then()
    }

    return (
      <>
        <main className="flex h-screen flex-col justify-between bg-gray-50">
          <Nav auth={auth} />
          <div className="flex flex-col items-center justify-center mt-16">
            <h1>Ai ai ai ai ai!!! En feil oppsto.</h1>
            <p>Melding: {auth.error.message}</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (auth.isAuthenticated) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${auth.user?.access_token}`
  }

  return (
    <>
      <main className="flex h-full min-h-screen flex-col justify-between bg-gray-50">
        <CurrentUserProvider>
          <NotificationProvider>
            <Nav auth={auth} />
            <div className="mb-auto">
              <Outlet />
            </div>
            <Notification />
          </NotificationProvider>
        </CurrentUserProvider>
      </main>
      <Footer />
    </>
  )
}
