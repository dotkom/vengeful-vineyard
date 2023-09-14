import { Fragment } from "react";
import { LeaderboardUser } from "../../helpers/types";
import { PunishmentItem } from "./PunishmentItem";

interface PunishmentListProps {
  user: LeaderboardUser;
}

export const PunishmentList = ({ user }: PunishmentListProps) => {
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
        />
      ))}
    </Fragment>
  );
};
