import axios from "axios"
import { useAuth } from "react-oidc-context"
import { Outlet, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Footer } from "../../components/footer"
import { Nav } from "../../components/nav"
import { Notification } from "../../components/notification"
import { Spinner } from "../../components/spinner"
import { CurrentUserProvider } from "../../helpers/context/currentUserContext"
import { NotificationProvider } from "../../helpers/context/notificationContext"
import { DarkModeProvider } from "../../DarkModeContext"
import { topStreakersQuery } from "../../helpers/api"
import React, { useEffect, useState } from "react"
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

  useEffect(() => {
    setTimeout(() => checkSigninRedirect(navigate), 100)
  }, [])

  const [bannerDismissed, setBannerDismissed] = useState(false)

  const { data: topStreakers } = useQuery({
    ...topStreakersQuery(),
    enabled: auth.isAuthenticated,
  })

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>
    case "signoutRedirect":
      return <div>Signing you out...</div>
  }

  if (auth.isLoading) {
    return (
      <>
        <main className="flex h-screen flex-col bg-gray-50 pb-40">
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
        <main className="flex h-screen flex-col justify-between bg-gray-50 pb-40">
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
      <main className="flex h-full min-h-screen flex-col justify-between bg-gray-50 pb-40">
        <CurrentUserProvider>
          <NotificationProvider>
            <Nav auth={auth} />
            {topStreakers && topStreakers.length > 0 && !bannerDismissed && (
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 py-1.5 text-amber-800 dark:text-amber-200 text-xs font-medium">
                <div className="animate-marquee inline-flex whitespace-nowrap">
                  {[0, 1].map((copy) => (
                    <span key={copy} className="inline-flex">
                      {topStreakers.map((s, i) => (
                        <span key={i} className="mx-8">
                          🔥 {s.display_name} er i flammer med {s.streak_length} ukers straffe-streak i {s.group_name}!
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 dark:text-amber-600 dark:hover:text-amber-300 transition-colors text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}
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
