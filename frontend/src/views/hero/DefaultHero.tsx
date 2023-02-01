import { AuthContextProps } from "react-oidc-context";
import { Button } from "../../components/button";

interface DefaultHeroProps {
  auth: AuthContextProps;
}

export const DefaultHero = ({ auth }: DefaultHeroProps) => (
  <section className="bg-blue-900 pb-32">
    <div className="flex flex-col gap-4 px-4 py-16 sm:block">
      <div className="max-w-5xl md:m-auto">
        <h1 className="text-white text-2xl font-medium my-4">
          Velkommen til Vengeful Vineyard 🍺
        </h1>
        <Button
          clickHandler={() => void auth.signinRedirect()}
          label="Logg inn"
        />
      </div>
    </div>
  </section>
);
