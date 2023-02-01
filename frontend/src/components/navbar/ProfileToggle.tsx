import { Fragment, useState } from "react";
import { User } from "react-feather";
import { AuthContextProps } from "react-oidc-context";
import { ProfileModal } from "./ProfileModal";

interface ProfileToggleProps {
  auth: AuthContextProps;
}

export const ProfileToggle = ({ auth }: ProfileToggleProps) => {
  const [showProfile, setShowProfile] = useState(false);

  const toggleProfile = () => setShowProfile(!showProfile);

  return (
    <Fragment>
      <User
        size={40}
        className="cursor-pointer bg-pink-200 hover:bg-pink-300 rounded-full p-2 absolute top-4 right-4"
        onClick={toggleProfile}
      />
      {showProfile && <ProfileModal auth={auth} />}
    </Fragment>
  );
};
