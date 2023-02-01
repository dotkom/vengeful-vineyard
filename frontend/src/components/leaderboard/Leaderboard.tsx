import { LeaderboardItem } from "./LeaderboardItem";
import { leaderboardData } from "../../helpers/mockData";

export const Leaderboard = () => (
  <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-slate-600 border-b">
          <th className="text-left">
            <p className="ml-8 my-4">Navn</p>
          </th>
          <th>Øl</th>
          <th>Vin</th>
        </tr>
      </thead>
      <tbody>
        {leaderboardData.map((person) => (
          <LeaderboardItem person={person} key={person.name} />
        ))}
      </tbody>
    </table>
  </article>
);
