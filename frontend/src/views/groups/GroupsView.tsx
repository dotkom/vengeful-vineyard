import { useQuery } from "@tanstack/react-query";
import { Table } from "../../components/table";
import { Tabs } from "../../components/tabs";
import { WallOfShame } from "../../components/wallOfShame";
import { GROUPS_URL, LEADERBOARD_URL } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import { Group, Leaderboard as LeaderboardType } from "../../helpers/types";
import { useState } from "react";
import { mockData } from "../../helpers/tmpMock";

/**
 * base
 1: /group/me
 2: /group/{group_id}
 3: /group/{group_id}/totalPunishmentValue

 *  wall of shame
 1: /user/leaderboard
 */

export const GroupsView = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined
  );

  const { data: groups } = useQuery({
    queryKey: ["groupsData"],
    queryFn: () =>
      axios.get(GROUPS_URL).then((res: AxiosResponse<Group[]>) => res.data),
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ["groupLeaderboard"],
    queryFn: () =>
      axios
        .get(LEADERBOARD_URL)
        .then((res: AxiosResponse<LeaderboardType>) => res.data),
    enabled: !!groups,
  });

  return (
    <section className="mt-16">
      <Tabs
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groups={groups}
      />
      <Table data={data} isLoading={isLoading} />
    </section>
  );
};
