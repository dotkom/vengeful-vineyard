import { NotificationContext, NotificationType } from "../../helpers/notificationContext"

import { Footer } from "../../components/footer"
import { Nav } from "../../components/nav"
import { Notification } from "../../components/notification"
import { Outlet } from "react-router-dom"
import { Spinner } from "../../components/spinner"
import { UserContext } from "../../helpers/userContext"
import axios from "axios"
import { useAuth } from "react-oidc-context"
import { useState } from "react"

export const Layout = () => {
  const auth = useAuth()
  const [notification, setNotification] = useState<NotificationType>({
    show: false,
    title: "",
    text: "",
    type: "success",
  })
  const [user, setUser] = useState({
    user_id: "",
  })

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>
    case "signoutRedirect":
      return <div>Signing you out...</div>
  }

  if (auth.isLoading) {
    return (
      <main className="flex h-screen flex-col justify-between bg-gray-50">
        <Nav auth={auth} />
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
        <Footer />
      </main>
    )
  }

  if (auth.error) {
    return (
      <main className="flex h-screen flex-col justify-between bg-gray-50">
        <Nav auth={auth} />
        <div className="flex items-center justify-center">
          <h1>Ai ai ai ai ai!!!</h1>
          <pre>{auth.error.message}</pre>
        </div>
        <Footer />
      </main>
    )
  }

  if (auth.isAuthenticated) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${auth.user?.access_token}`
  }

  return (
    <main className="flex h-full min-h-screen flex-col justify-between bg-gray-50">
      <UserContext.Provider value={{ user, setUserContext: setUser }}>
        <NotificationContext.Provider value={{ notification, setNotification }}>
          <Nav auth={auth} />
          <div className="mb-auto">
            <Outlet />
          </div>
          <Footer />
          <Notification />
        </NotificationContext.Provider>
      </UserContext.Provider>
    </main>
  )
}
