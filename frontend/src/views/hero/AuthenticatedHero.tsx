import { AuthContextProps } from "react-oidc-context";
import { Stats } from "../../components/stats";

interface AuthenticatedHeroProps {
  auth: AuthContextProps;
}

export const AuthenticatedHero = ({ auth }: AuthenticatedHeroProps) => (
  <section className="bg-[url('/online.png')] bg-no-repeat bg-cover bg-center w-full h-full min-h-[420px]">
    <Stats />
  </section>
);
