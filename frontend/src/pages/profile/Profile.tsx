import { useAuth } from "react-oidc-context"
import { LandingPage } from "../../views/hero"
import { AuthenticatedProfile } from "./AuthenticatedProfile"

export const Profile = () => {
  const auth = useAuth()

  if (auth.isAuthenticated) {
    return <AuthenticatedProfile />
  }

  return <LandingPage />
}
