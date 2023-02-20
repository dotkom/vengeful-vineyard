import { LeaderboardItem } from "./LeaderboardItem";
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
      <article className="h-full max-w-5xl bg-white shadow-inner md:m-auto md:rounded">
        <h1 className="py-32 text-center text-5xl font-bold">
          Wall of Shame🦋
        </h1>
        <p className="py-16 text-center">Loading...</p>
      </article>
    );

  if (error)
    return (
      <article className="h-full max-w-5xl bg-white shadow-inner md:m-auto md:rounded">
        <h1 className="py-32 text-center text-5xl font-bold">
          Wall of Shame🦋
        </h1>
        <p className="py-16 text-center">
          An error has occurred: {error.message}
        </p>
      </article>
    );

  return (
    <article className="h-full max-w-5xl bg-white shadow-inner md:m-auto md:rounded">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-md border-b text-slate-600">
            <th className="text-left">
              <p className="my-4 ml-4">Navn</p>
            </th>
            <th>
              <p className="mr-8 text-right">Gjeld</p>
            </th>
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
