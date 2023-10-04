import { useQuery } from "@tanstack/react-query";
import { Table } from "../../components/table";
import { ME_URL, getGroupLeaderboardUrl } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import { Group, User } from "../../helpers/types";
import { useContext, useEffect, useState } from "react";
import { Tabs } from "./tabs/Tabs";
import { UserContext } from "../../helpers/userContext";
import { useNavigate } from "react-router-dom";

export const GroupsView = (props: { selectedGroupId?: number }) => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["groupsData"],
    queryFn: () =>
      axios.get(ME_URL).then((res: AxiosResponse<User>) => {
        setUser({ user_id: res.data.user_id });
        return res.data;
      }),
  });

  useEffect(() => {
    if (user && props.selectedGroupId === undefined) {
      console.log("hei");
      navigate(`/groups/${user.groups[0].group_id}`);
    }
  }, [user, props.selectedGroupId]);

  const selectedGroup = user?.groups.find(
    (group) => group.group_id === props.selectedGroupId
  );

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["groupLeaderboard", selectedGroup?.group_id],
    queryFn: () =>
      axios
        .get(getGroupLeaderboardUrl(selectedGroup!.group_id))
        .then((res: AxiosResponse<Group>) => res.data),
    enabled: !!user && !!selectedGroup,
  });

  return (
    <section className="mt-16">
      <Tabs
        selectedGroup={selectedGroup}
        setSelectedGroup={a => navigate(`/groups/${a.group_id}`)}
        groups={user ? user.groups : undefined}
        dataRefetch={refetch}
      />
      <Table groupData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  );
};
