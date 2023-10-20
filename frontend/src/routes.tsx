import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
} from "react-router-dom";
import { Layout } from "./views/layout";
import { Home } from "./pages/home";
import { Profile } from "./pages/profile";
import { WallOfShame } from "./pages/wallOfShame";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/komiteer/:groupName" element={<Home />} />
      <Route path="/profil" element={<Profile />} />
      <Route path="/wall-of-shame" element={<WallOfShame />} />
    </Route>
  )
);
