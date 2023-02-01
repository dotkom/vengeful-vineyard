import axios from "axios";
import { useAuth } from "react-oidc-context";
import { Button } from "./components/button";
import { DebtClock } from "./components/debtClock";
import { Footer } from "./components/footer";
import { Leaderboard } from "./components/leaderboard";
import { Navbar } from "./components/navbar";
import { Tabbar } from "./components/tabbar";

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
      <main>
        <Navbar />
        <section className="bg-blue-900 pb-32">
          <div className="flex flex-col gap-4 px-4 py-16 sm:block">
            <div className="max-w-5xl md:m-auto">
              <Button
                clickHandler={() => void auth.removeUser()}
                label="Logg ut"
              />
              <h1 className="text-white text-2xl font-medium my-4">
                Hei hei {auth.user?.profile.name} 😌
              </h1>

              <DebtClock />
            </div>
          </div>
        </section>

        <section className="-mt-32">
          <Tabbar />
          <Leaderboard />
        </section>

        <Footer />
      </main>
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
