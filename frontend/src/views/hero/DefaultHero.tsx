import { AuthContextProps } from "react-oidc-context";
import { Button } from "../../components/button";

interface DefaultHeroProps {
  auth: AuthContextProps;
}

export const DefaultHero = ({ auth }: DefaultHeroProps) => (
  <section className="bg-blue-900 px-4 py-16 flex flex-col gap-4 sm:block">
    <h1 className="text-white text-2xl font-medium sm:mb-4">
      Velkommen til Vengeful Vineyard 🍺
    </h1>
    <Button clickHandler={() => void auth.signinRedirect()} label="Logg inn" />
  </section>
);
