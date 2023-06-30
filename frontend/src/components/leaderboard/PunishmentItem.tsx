import dayjs from "dayjs";
import { Punishment } from "../../helpers/types";

interface PunishmentItemProps {
  punishment: Punishment;
}

export const PunishmentItem = ({ punishment }: PunishmentItemProps) => {
  const date = dayjs(punishment.created_at);
  const formattedDate = date.format("DD. MMM YY");

  return (
    <div className="relative border-b border-l-8 border-l-indigo-600 md:border-l-4 flex">
      <div className="text-left font-light">
        <p className="m-4">
          <span className="block">{punishment.reason}</span>
          <span className="block text-gray-500">
            - Gitt av {punishment.created_by}
          </span>
        </p>
      </div>
      <div className="max-w-xs">
        <div className="py-4">
          {Array.from({ length: punishment.amount }, (_, i) => (
            <span key={`${punishment.punishment_id}/${i}`} className="text-xl">
              {punishment.punishment_type_id === 1 && <span>🍺</span>}
              {punishment.punishment_type_id === 2 && <span>🍷</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="text-gray-500' absolute right-8 top-4 font-normal">
        {formattedDate}
      </div>
    </div>
  );
};
