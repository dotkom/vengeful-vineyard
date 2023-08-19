import { useAuth } from "react-oidc-context";
import { GroupsView } from "../../views/groups";
import { DefaultHero } from "../../views/hero";
import { AuthenticatedProfile } from "./AuthenticatedProfile";

export const Profile = () => {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <AuthenticatedProfile />;
  }

  return <DefaultHero auth={auth} />;
};
