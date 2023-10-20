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

  const params = useParams<{ groupName?: string }>();
  const selectedGroupName = params.groupName;

  const { data: user } = useQuery({
    queryKey: ["groupsData"],
    queryFn: () =>
      axios.get(ME_URL).then((res: AxiosResponse<User>) => {
        const user = res.data;
        user.groups.sort((a, b) => a.name_short.localeCompare(b.name_short));
        const duplicateNames = new Map<string, number>();
        for (const group of user.groups) {
            if (duplicateNames.has(group.name_short)) {
              const count = duplicateNames.get(group.name_short)!;
              duplicateNames.set(group.name_short, count + 1);
              group.path_name = `${group.name_short}-${count}`;
            } else {
                duplicateNames.set(group.name_short, 1);
                group.path_name = group.name_short;
            }
        }
        setUser({ user_id: user.user_id });
        return user;
      }),
  });

  useEffect(() => {
    if (user && selectedGroupName === undefined) {
      navigate(`/grupper/${user.groups[0].path_name}`);
    }
  }, [user, selectedGroupName]);

  const selectedGroup = user?.groups.find(
    (group) => group.path_name === selectedGroupName
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
        setSelectedGroup={group => group && navigate(`/grupper/${group.path_name}`)}
        groups={user ? user.groups : undefined}
        dataRefetch={refetch}
      />
      <Table groupData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  );
};
