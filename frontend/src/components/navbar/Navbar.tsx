import { AuthContextProps } from "react-oidc-context";
import OnlineIcon from "../onlineIcon/OnlineIcon";
import { ProfileModal } from "./ProfileModal";

interface NavbarProps {
  auth: AuthContextProps;
}

export const Navbar = ({ auth }: NavbarProps) => (
  <nav className="bg-white p-4 max-w-5xl md:m-auto flex  relative">
    <a href="/">
      <OnlineIcon className="w-32" />
    </a>
    <div className="absolute top-4 right-4">
      <ProfileModal auth={auth} />
    </div>
  </nav>
);
