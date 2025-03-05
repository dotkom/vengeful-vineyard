import { Link } from "react-router-dom";
import { VersusBetRow } from "../components/betting/VersusBetRow";
import { Button } from "../components/button";

export default function BettingPage() {
	return (
		<section className="mt-8 md:mt-16 max-w-5xl w-[90%] mx-auto">
      <h1 className="mb-4 text-center md:text-xl font-medium text-black">Betting</h1>
      <div className="w-full flex flex-row gap-x-2 justify-end mb-2">
        <Button>
          Lag ny bet
        </Button>
      </div>
			<ul className="w-full flex flex-col gap-y-3">
				<VersusBetRow />
				<VersusBetRow />
				<VersusBetRow />
				<VersusBetRow />
			</ul>
		</section>
	);
}
