import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

import { Fragment } from "react";
import { LeaderboardUser } from "../../helpers/types";
import { PunishmentItem } from "./PunishmentItem";
import { PunishmentType } from "../../../helpers/types";

interface PunishmentListProps {
  user: LeaderboardUser;
  punishmentTypes: PunishmentType[];
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const PunishmentList = ({
  user,
  punishmentTypes,
  dataRefetch,
}: PunishmentListProps) => {
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
