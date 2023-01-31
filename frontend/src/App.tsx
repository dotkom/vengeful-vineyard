import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <p className="text-white">Loading...</p>;
  }

  if (auth.error) {
    return <p className="text-white">Oops... {auth.error.message}</p>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="text-white">
        Hello {auth.user?.profile.sub}{" "}
        <button onClick={() => void auth.removeUser()}>Log out</button>
      </div>
    );
  }

  return (
    <button onClick={() => void auth.signinRedirect()} className="text-white">
      Log in
    </button>
  );
}

export default App;
