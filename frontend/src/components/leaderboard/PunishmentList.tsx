import { Fragment } from "react";
import { Punishment } from "../../helpers/types";
import { CreatePunishmentForm } from "./CreatePunishmentForm";
import { PunishmentItem } from "./PunishmentItem";

interface PunishmentListProps {
  punishments: Punishment[];
}

export const PunishmentList = ({ punishments }: PunishmentListProps) => {
  if (punishments.length === 0) {
    return (
      <Fragment>
        <CreatePunishmentForm groupId={1} userId={1} />
        <tr className="border-b-2">
          <th>
            <p className="font-light p-2 text-left m-4">Ingen straffer 😇</p>
          </th>
        </tr>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {punishments.map((punishment) => (
        <PunishmentItem
          punishment={punishment}
          key={punishment.punishment_id}
        />
      ))}
    </Fragment>
  );
};
