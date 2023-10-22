import { useQuery } from "@tanstack/react-query";
import { Table } from "../../components/table";
import { ME_URL, getGroupLeaderboardUrl } from "../../helpers/api";
import axios, { AxiosResponse } from "axios";
import { Group, GroupUser, User } from "../../helpers/types";
import { useContext, useEffect, useState } from "react";
import { Tabs } from "./tabs/Tabs";
import { UserContext } from "../../helpers/userContext";
import { useNavigate, useParams } from "react-router-dom";
import { sortGroupUsers, sortGroups } from "../../helpers/sorting";
import {PunishmentsEditor} from "./PunishmentsEditor";

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
        setUser({ user_id: user.user_id });
        user.groups = sortGroups(user.groups);
        user.groups.forEach(
          (group) =>
            (group.members = sortGroupUsers(
              group.members,
              group.punishment_types
            ))
        );
        return user;
      }),
  });

  useEffect(() => {
    if (user && selectedGroupName === undefined) {
      navigate(`/komiteer/${user.groups[0].name_short.toLowerCase()}`);
    }
  }, [user, selectedGroupName]);

  const selectedGroup = user?.groups.find(
    (group) => group.name_short.toLowerCase() === selectedGroupName?.toLowerCase()
  );

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["groupLeaderboard", selectedGroup?.group_id],
    queryFn: () =>
      axios
        .get(getGroupLeaderboardUrl(selectedGroup!.group_id))
        .then((res: AxiosResponse<Group>) => {
          const group = res.data;
          group.members = sortGroupUsers(group.members, group.punishment_types);
          return group;
        }),
    enabled: !!user && !!selectedGroup,
  });

  return (
    <section className="mt-16">
      <Tabs
        selectedGroup={selectedGroup}
        setSelectedGroup={(group) =>
            group && navigate(`/komiteer/${group.name_short.toLowerCase()}`)
        }
        groups={user ? user.groups : undefined}
        dataRefetch={refetch}
      />
      <Table groupData={data} isLoading={isLoading} dataRefetch={refetch} />
    </section>
  );
};
