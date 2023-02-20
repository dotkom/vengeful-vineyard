import { Fragment } from "react";
import { LeaderboardUser } from "../../helpers/types";
import { CreatePunishmentTableRow } from "./createPunishmentTableRow";
import { PunishmentItem } from "./PunishmentItem";

interface PunishmentListProps {
  user: LeaderboardUser;
}

export const PunishmentList = ({ user }: PunishmentListProps) => {
  if (user.punishments.length === 0) {
    return (
      <Fragment>
        <CreatePunishmentTableRow groupId={1} userId={user.user_id} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <CreatePunishmentTableRow groupId={1} userId={user.user_id} />
      {user.punishments.map((punishment) => (
        <PunishmentItem
          punishment={punishment}
          key={punishment.punishment_id}
        />
      ))}
    </Fragment>
  );
};
