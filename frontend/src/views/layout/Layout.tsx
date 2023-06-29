import { AuthContextProps } from "react-oidc-context";
import { Footer } from "../../components/footer";
import { Nav } from "../../components/nav";
import { Navbar } from "../../components/navbar";

interface LayoutProps {
  auth: AuthContextProps;
  children: React.ReactNode;
}

export const Layout = ({ auth, children }: LayoutProps) => (
  <main>
    {/*
    <Navbar auth={auth} />
    */}
    <Nav auth={auth} />
    {children}
    <Footer />
  </main>
);
