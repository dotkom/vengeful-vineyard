import { createRoutesFromElements, Route, RouterProvider, Navigate, createBrowserRouter } from "react-router-dom"
import { Layout } from "./views/layout"
import { Profile } from "./pages/profile"
import { WallOfShame } from "./pages/wallOfShame"
import { Committees } from "./pages/committees"
import { useAuth } from "react-oidc-context"
import { LandingPage } from "./views/hero"
import { GroupView } from "./views/groups"
import LoginRegisterPromptPage from "./views/LoginRegisterPromptPage"

const authenticatedRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<GroupView />} />
      <Route path="/gruppe/:groupName" element={<GroupView />} />
      <Route path="/profil" element={<Profile />} />
      <Route path="/wall-of-shame" element={<WallOfShame />} />
      <Route path="/committees" element={<Committees />} />
    </Route>
  )
)

const unauthenticatedRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/gruppe/:groupName" element={<LoginRegisterPromptPage />} />
      <Route path="/profil" element={<Navigate to="/" />} />
      <Route path="/wall-of-shame" element={<Navigate to="/" />} />
      <Route path="/committees" element={<Navigate to="/" />} />
    </Route>
  )
)

export default function AuthRouterProvider() {
  const auth = useAuth()

  return <RouterProvider router={auth.isAuthenticated ? authenticatedRouter : unauthenticatedRouter} />
}
