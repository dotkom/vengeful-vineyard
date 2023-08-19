import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
} from "react-router-dom";
import { Layout } from "./views/layout";
import { Home } from "./pages/home";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Home />} />
    </Route>
  )
);
