import { useAuth } from "react-oidc-context";
import { AuthenticatedHero, DefaultHero } from "./views/hero";
import { Layout } from "./views/layout";
import { LeaderboardView } from "./views/leaderboard";

const App = () => {
  const auth = useAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <p>Loading...</p>;
  }

  if (auth.error) {
    return <p>Oops... {auth.error.message}</p>;
  }

  if (auth.isAuthenticated) {
    return (
      <Layout>
        <AuthenticatedHero auth={auth} />
        <LeaderboardView />
      </Layout>
    );
  }

  return (
    <Layout>
      <DefaultHero auth={auth} />
    </Layout>
  );
};

export default App;
