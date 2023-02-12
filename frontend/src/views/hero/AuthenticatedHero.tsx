import { AuthContextProps } from "react-oidc-context";

interface AuthenticatedHeroProps {
  auth: AuthContextProps;
}

export const AuthenticatedHero = ({ auth }: AuthenticatedHeroProps) => (
  <section className="bg-[url('/public/online.png')] bg-no-repeat bg-cover bg-center w-full h-full min-h-[420px]" />
);
