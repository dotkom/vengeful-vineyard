import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

import { Fragment } from "react";
import { PunishmentItem } from "./PunishmentItem";
import { GroupUser, PunishmentType, LeaderboardUser } from "../../../helpers/types";

interface PunishmentListProps {
  groupUser?: GroupUser | undefined;
  leaderboardUser?: LeaderboardUser | undefined;
  punishmentTypes: PunishmentType[];
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const PunishmentList = ({
  groupUser = undefined,
  leaderboardUser = undefined,
  punishmentTypes,
  dataRefetch,
}: PunishmentListProps) => {
  const user = groupUser ?? leaderboardUser;
  if (user === undefined) {
    return <p>user is undefined</p>;
  }

  if (user.punishments.length === 0) {
    return (
      <Fragment>
        <p className="p-4">Ingen straffer</p>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {user.punishments.map((punishment) => (
        <PunishmentItem
          punishment={punishment}
          punishmentTypes={punishmentTypes}
          key={punishment.punishment_id}
          dataRefetch={dataRefetch}
        />
      ))}
    </Fragment>
  );
};
