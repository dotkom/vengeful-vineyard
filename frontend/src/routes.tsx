import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
} from "react-router-dom";
import { Layout } from "./views/layout";
import { Home } from "./pages/home";
import { Profile } from "./pages/profile";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/profil" element={<Profile />} />
    </Route>
  )
);
