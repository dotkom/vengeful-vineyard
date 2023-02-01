import { AuthContextProps } from "react-oidc-context";
import { Button } from "../../components/button";
import { DebtClock } from "../../components/debtClock";

interface AuthenticatedHeroProps {
  auth: AuthContextProps;
}

export const AuthenticatedHero = ({ auth }: AuthenticatedHeroProps) => (
  <section className="bg-blue-900 pb-32">
    <div className="flex flex-col gap-4 px-4 py-16 sm:block">
      <div className="max-w-5xl md:m-auto">
        <Button clickHandler={() => void auth.removeUser()} label="Logg ut" />
        <h1 className="text-white text-2xl font-medium my-4">
          Hei hei {auth.user?.profile.name} 😌
        </h1>
        <DebtClock />
      </div>
    </div>
  </section>
);
