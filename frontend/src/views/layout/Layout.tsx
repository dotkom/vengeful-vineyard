import { AuthContextProps, useAuth } from "react-oidc-context";
import { Footer } from "../../components/footer";
import { Nav } from "../../components/nav";
import axios from "axios";
import { Outlet } from "react-router-dom";
import { Spinner } from "../../components/spinner";

export const Layout = () => {
  const auth = useAuth();

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return (
      <main className="flex h-screen flex-col justify-between">
        <Nav auth={auth} />
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
        <Footer />
      </main>
    );
  }

  if (auth.error) {
    return <p>Oops... {auth.error.message}</p>;
  }

  if (auth.isAuthenticated) {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${auth.user?.access_token}`;
  }

  return (
    <main className="flex h-screen flex-col justify-between">
      <Nav auth={auth} />
      <div className="mb-auto">
        <Outlet />
      </div>
      <Footer />
    </main>
  );
};
