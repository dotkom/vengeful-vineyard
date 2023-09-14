import { useQuery } from "@tanstack/react-query";
import { Table } from "../../components/table";
import { Tabs } from "../../components/tabs";
import { GROUPS_URL, getGroupLeaderboardUrl } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import { Group } from "../../helpers/types";
import { useState } from "react";

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

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["groupLeaderboard"],
    queryFn: () =>
      axios
        .get(getGroupLeaderboardUrl(groups[0].group_id))
        .then((res: AxiosResponse<Group>) => res.data),
    enabled: !!groups,
  });

  return (
    <section className="mt-16">
      <Tabs
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groups={groups}
        dataRefetch={refetch}
      />
      <Table data={data} isLoading={isLoading} />
    </section>
  );
};
