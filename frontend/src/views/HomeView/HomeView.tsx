import { useQuery } from "@tanstack/react-query";
import { GROUPS_URL, LEADERBOARD_URL } from "../../helpers/api";
import axios from "axios";

export const HomeView = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["leaderboardData"],
    queryFn: () => axios.get(LEADERBOARD_URL).then((res: any) => res.data),
  });

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>An error has occurred: {error.message}</p>;

  console.log(data);

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{" "}
      <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
};
