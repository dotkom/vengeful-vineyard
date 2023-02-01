import axios from "axios";
import { useAuth } from "react-oidc-context";
import { Button } from "./components/button";
import { Navbar } from "./components/navbar";
import { HomeView } from "./views/HomeView";

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
    axios.defaults.headers.common = {
      Authorization: "Bearer " + auth.user?.id_token,
    };
    return (
      <div>
        <HomeView />
        Hello {auth.user?.profile.name}{" "}
        <Button clickHandler={() => void auth.removeUser()} label="Log out" />
      </div>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="bg-blue-900 px-4 py-16 flex flex-col gap-4 sm:block">
        <h1 className="text-white text-2xl font-medium sm:mb-4">
          Velkommen til Vengeful Vineyard 🍺
        </h1>
        <Button
          clickHandler={() => void auth.signinRedirect()}
          label="Logg inn"
        />
      </section>
    </main>
  );
};

export default App;
