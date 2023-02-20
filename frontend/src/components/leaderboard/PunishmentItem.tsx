import dayjs from "dayjs";
import { Punishment } from "../../helpers/types";

interface PunishmentItemProps {
  punishment: Punishment;
}

export const PunishmentItem = ({ punishment }: PunishmentItemProps) => {
  const date = dayjs(punishment.created_at);
  const formattedDate = date.format("DD. MMM YY");

  return (
    <tr className="border-b border-l-8 border-l-lime-800 md:border-l-4 relative">
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
        {formattedDate}
      </th>
    </tr>
  );
};
