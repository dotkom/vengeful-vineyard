import { createRoutesFromElements, Route, createHashRouter } from "react-router-dom"
import { Layout } from "./views/layout"
import { Home } from "./pages/home"
import { Profile } from "./pages/profile"
import { WallOfShame } from "./pages/wallOfShame"
import { Committees } from "./pages/committees"

export const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/komiteer/:groupName" element={<Home />} />
      <Route path="/profil" element={<Profile />} />
      <Route path="/wall-of-shame" element={<WallOfShame />} />
      <Route path="/committees" element={<Committees />} />
    </Route>
  )
)
