import { AuthContextProps } from "react-oidc-context";
import OnlineIcon from "../onlineIcon/OnlineIcon";
import { ProfileModal } from "./ProfileModal";

interface NavbarProps {
  auth: AuthContextProps;
}

export const Navbar = ({ auth }: NavbarProps) => (
  <nav className="bg-gray-50 border-b">
    <div className="max-w-5xl p-4 flex md:m-auto relative">
      <a href="/">
        <OnlineIcon className="w-32" />
      </a>
      <div className="absolute top-4 right-4">
        <ProfileModal auth={auth} />
      </div>
    </div>
  </nav>
);
