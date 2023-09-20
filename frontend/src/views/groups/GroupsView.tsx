import { useQuery } from "@tanstack/react-query";
import { Table } from "../../components/table";
import { ME_URL, getGroupLeaderboardUrl } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import { Group, User } from "../../helpers/types";
import { useContext, useState } from "react";
import { Tabs } from "./tabs/Tabs";
import { UserContext } from "../../helpers/userContext";

export const GroupsView = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined
  );
  const { setUser } = useContext(UserContext);

  const { data: user } = useQuery({
    queryKey: ["groupsData"],
    queryFn: () =>
      axios.get(ME_URL).then((res: AxiosResponse<User>) => {
        setUser({ user_id: res.data.user_id });
        return res.data;
      }),
  });

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["groupLeaderboard"],
    queryFn: () =>
      axios
        .get(getGroupLeaderboardUrl(user.groups[0].group_id))
        .then((res: AxiosResponse<Group>) => res.data),
    enabled: !!user,
  });

  return (
    <section className="mt-16">
      <Tabs
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groups={user ? user.groups : undefined}
        dataRefetch={refetch}
      />
      <Table groupData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  );
};
