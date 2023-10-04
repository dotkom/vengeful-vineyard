import { useAuth } from "react-oidc-context";
import { GroupsView } from "../../views/groups";
import { DefaultHero } from "../../views/hero";
import { useParams } from "react-router-dom";

export const Home = () => {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <GroupsView />;
  }

  return <DefaultHero auth={auth} />;
};
