import { Fragment } from "react";
import { Punishment } from "../../helpers/types";

interface PunishmentListProps {
  punishments: Punishment[];
}

export const PunishmentList = ({ punishments }: PunishmentListProps) => {
  if (punishments.length === 0) {
    return (
      <Fragment>
        <tr className="border-b-2 relative">
          <th className="font-light text-left">
            <input
              type="text"
              placeholder="Begrunnelse for staff"
              className="p-2 border rounded m-4"
            />
          </th>
          <th className="absolute font-normal text-gray-500' right-8 top-4">
            LOL
          </th>
        </tr>

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
        <tr className="border-b-2 relative" key={punishment.punishment_id}>
          <th className="font-light text-left">
            <p className="m-4">
              <span className="block">{punishment.reason}</span>
              <span className="block text-gray-500">
                - Gitt av {punishment.created_by}
              </span>
            </p>
          </th>
          <th />
          <th className="absolute font-normal text-gray-500' right-8 top-4">
            {punishment.created_at}
          </th>
        </tr>
      ))}
    </Fragment>
  );
};
