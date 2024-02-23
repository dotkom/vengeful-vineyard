import { Button } from "../components/button"
import { useAuth } from "react-oidc-context"
import { Link, useLocation } from "react-router-dom"
import { signinAndReturn } from "../helpers/auth"

export default function LoginRegisterPromptPage() {
  const auth = useAuth()
  const location = useLocation()

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-40">
      <h1 className="text-6xl font-bold text-center">Logg inn for å se denne siden!</h1>
      <p className="text-center text-lg font-medium text-gray-600">
        Dersom du ikke har en Onlineweb-konto opprett en først.
      </p>
      <div className="flex flex-row space-x-4">
        <Button onClick={() => signinAndReturn(auth, location)}>Logg inn</Button>
        <Button>
          <Link to="https://old.online.ntnu.no/auth/register/">Ny konto</Link>
        </Button>
      </div>
    </div>
  )
}
