import { useAuth } from "react-oidc-context";
import { GroupsView } from "../../views/groups";
import { DefaultHero } from "../../views/hero";
import { useParams } from "react-router-dom";

export const Home = () => {
  const auth = useAuth();

  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId ? parseInt(params.groupId) : undefined;

  if (auth.isAuthenticated) {
    return <GroupsView selectedGroupId={groupId} />;
  }

  return <DefaultHero auth={auth} />;
};
