import { Fragment } from "react";
import { Punishment } from "../../helpers/mockData";

interface PunishmentListProps {
  punishments: Punishment[];
}

export const PunishmentList = ({ punishments }: PunishmentListProps) => {
  if (punishments.length === 0) {
    return (
      <tr className="border-b-2">
        <th>
          <p className="font-light p-2 text-left m-4">Ingen straffer 😇</p>
        </th>
      </tr>
    );
  }

  return (
    <Fragment>
      {punishments.map((punishment) => (
        <tr className="border-b-2 relative" key={punishment.reason}>
          <th className="font-light text-left">
            <p className="m-4">
              <span className="block">{punishment.reason}</span>
              <span className="block text-gray-500">
                - Gitt av {punishment.author}
              </span>
            </p>
          </th>
          <th />
          <th className="absolute font-normal text-gray-500' right-8 top-4">
            {punishment.date}
          </th>
        </tr>
      ))}
    </Fragment>
  );
};
