import { useQuery } from "@tanstack/react-query";
import { Table } from "../../components/table";
import { ME_URL, getGroupLeaderboardUrl } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import { Group, User } from "../../helpers/types";
import { useContext, useEffect, useState } from "react";
import { Tabs } from "./tabs/Tabs";
import { UserContext } from "../../helpers/userContext";
import { useNavigate, useParams } from "react-router-dom";

export const GroupsView = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const params = useParams<{ groupId?: string }>();
  const selectedGroupId = parseInt(params.groupId ?? "") || undefined;

  const { data: user } = useQuery({
    queryKey: ["groupsData"],
    queryFn: () =>
      axios.get(ME_URL).then((res: AxiosResponse<User>) => {
        const user = res.data;
        user.groups.sort((a, b) => a.name_short.localeCompare(b.name_short));
        for (const group of user.groups) {
            group.members.sort((a, b) => {
                if (a.first_name === b.first_name) {
                    return a.last_name.localeCompare(b.last_name);
                }
                return a.first_name.localeCompare(b.first_name);
            });
        }
        setUser({ user_id: user.user_id });
        return user;
      }),
  });

  useEffect(() => {
    if (user && selectedGroupId === undefined) {
      navigate(`/groups/${user.groups[0].group_id}`);
    }
  }, [user, selectedGroupId]);

  const selectedGroup = user?.groups.find(
    (group) => group.group_id === selectedGroupId
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
        setSelectedGroup={group => group && navigate(`/groups/${group.group_id}`)}
        groups={user ? user.groups : undefined}
        dataRefetch={refetch}
      />
      <Table groupData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  );
};
