import { LeaderboardItem } from "./LeaderboardItem";
import { leaderboardData } from "../../helpers/mockData";
import { LEADERBOARD_URL } from "../../helpers/api";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { Leaderboard as LeaderboardType } from "../../helpers/types";

export const Leaderboard = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["leaderboardData"],
    queryFn: () =>
      axios
        .get(LEADERBOARD_URL)
        .then((res: AxiosResponse<LeaderboardType>) => res.data),
  });

  if (isLoading)
    return (
      <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
        <h1 className="text-5xl text-center font-bold py-32">
          Wall of Shame🦋
        </h1>
        <p className="text-center py-16">Loading...</p>
      </article>
    );

  if (error)
    return (
      <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
        <h1 className="text-5xl text-center font-bold py-32">
          Wall of Shame🦋
        </h1>
        <p className="text-center py-16">
          An error has occurred: {error.message}
        </p>
      </article>
    );

  return (
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
          {data?.results.map((user) => (
            <LeaderboardItem user={user} key={user.user_id} />
          ))}
        </tbody>
      </table>
    </article>
  );
};
