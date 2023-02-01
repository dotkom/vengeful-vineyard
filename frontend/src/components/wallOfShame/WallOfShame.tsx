import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LEADERBOARD_URL } from "../../helpers/api";

export const WallOfShame = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["leaderboardData"],
    queryFn: () => axios.get(LEADERBOARD_URL).then((res: any) => res.data),
  });

  if (isLoading)
    return (
      <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
        <h1 className="text-5xl text-center font-bold py-32">
          Wall of Shame🦋
        </h1>
        <p>Loading...</p>
      </article>
    );

  if (error)
    return (
      <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
        <h1 className="text-5xl text-center font-bold py-32">
          Wall of Shame🦋
        </h1>
        <p>An error has occurred: {error.message}</p>
      </article>
    );

  return (
    <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
      <h1 className="text-5xl text-center font-bold pt-32">Wall of Shame🦋</h1>
      <p className="text-center py-16">
        Data bra backend: {JSON.stringify(data)}
      </p>
    </article>
  );
};
