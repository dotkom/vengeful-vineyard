import dayjs from "dayjs";
import { Punishment } from "../../helpers/types";

interface PunishmentItemProps {
  punishment: Punishment;
}

export const PunishmentItem = ({ punishment }: PunishmentItemProps) => {
  const date = dayjs(punishment.created_at);
  const formattedDate = date.format("DD. MMM YY");

  return (
    <tr className="relative border-b border-l-8 border-l-indigo-600 md:border-l-4">
      <td className="text-left font-light">
        <p className="m-4">
          <span className="block">{punishment.reason}</span>
          <span className="block text-gray-500">
            - Gitt av {punishment.created_by}
          </span>
        </p>
      </td>
      <td />
      <td className="text-gray-500' absolute right-8 top-4 font-normal">
        {formattedDate}
      </td>
    </tr>
  );
};
