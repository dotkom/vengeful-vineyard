import { AuthContextProps } from "react-oidc-context";
import { Footer } from "../../components/footer";
import { Nav } from "../../components/nav";

interface LayoutProps {
  auth: AuthContextProps;
  children: React.ReactNode;
}

export const Layout = ({ auth, children }: LayoutProps) => (
  <main className="flex h-screen flex-col justify-between">
    <Nav auth={auth} />
    <div className="mb-auto">{children}</div>
    <Footer />
  </main>
);
