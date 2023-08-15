import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GROUPS_URL } from "../../helpers/api";

export const WallOfShame = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["groupsData"],
    queryFn: () => axios.get(GROUPS_URL).then((res: any) => res.data),
  });

  if (isLoading)
    return (
      <article className="h-full max-w-5xl bg-white shadow-inner md:m-auto md:rounded">
        <p className="py-16 text-center">Loading...</p>
      </article>
    );

  if (error)
    return (
      <article className="h-full max-w-5xl bg-white md:m-auto md:rounded">
        <p className="py-16 text-center">
          An error has occurred: {error.message}
        </p>
      </article>
    );

  return (
    <article className="md:roundead mt-16 h-full  max-w-5xl bg-white md:m-auto">
      <p className="py-16 text-center">
        Data bra backend: {JSON.stringify(data)}
      </p>
    </article>
  );
};
