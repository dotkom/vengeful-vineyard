import { Fragment } from "react";
import { LeaderboardUser } from "../../helpers/types";
import { PunishmentItem } from "./PunishmentItem";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

interface PunishmentListProps {
  user: LeaderboardUser;
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const PunishmentList = ({ user, dataRefetch }: PunishmentListProps) => {
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
          key={punishment.punishment_id}
          dataRefetch={dataRefetch}
        />
      ))}
    </Fragment>
  );
};
