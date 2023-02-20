import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GROUPS_URL, LEADERBOARD_URL } from "../../helpers/api";
import { Button } from "../button";

export const WallOfRequests = () => {
  const { status, data, error, refetch, isLoading } = useQuery({
    queryKey: ["testData"],
    queryFn: () =>
      axios.get(LEADERBOARD_URL).then((res: any) => {
        console.log(res.data);
        return res.data;
      }),
    enabled: false,
  });

  if (error)
    return (
      <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
        <h1 className="text-5xl text-center font-bold py-32">
          Wall of Requests
        </h1>
        <p className="text-center py-16">
          An error has occurred: {error.message}
        </p>
      </article>
    );

  return (
    <article className="bg-white h-full max-w-5xl md:m-auto md:rounded shadow-inner">
      <h1 className="text-5xl text-center font-bold pt-32">
        Wall of Requests🦋
      </h1>
      <Button label="Leaderboard" clickHandler={() => refetch()} />
    </article>
  );
};
