import { AuthContextProps } from "react-oidc-context";
import { Button } from "../button";

interface ProfileModalProps {
  auth: AuthContextProps;
}

export const ProfileModal = ({ auth }: ProfileModalProps) => (
  <div className="absolute top-16 right-4 rounded shadow w-64 bg-white px-2 py-4 flex">
    {auth.isAuthenticated ? (
      <Button clickHandler={() => void auth.removeUser()} label="Logg ut" />
    ) : (
      <Button
        clickHandler={() => void auth.signinRedirect()}
        label="Logg inn"
      />
    )}
  </div>
);
