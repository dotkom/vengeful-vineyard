import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <main>
    <Navbar />
    {children}
    <Footer />
  </main>
);
