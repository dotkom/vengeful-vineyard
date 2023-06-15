import React, { useState } from "react";
import { LeaderboardUser } from "../../helpers/types";
import { PunishmentList } from "./PunishmentList";

interface LeaderboardItemProps {
  user: LeaderboardUser;
}

export const LeaderboardItem = ({ user }: LeaderboardItemProps) => {
  const [showPunishments, setShowPunishments] = useState(false);

  const togglePunishments = () => setShowPunishments(!showPunishments);

  const totalPunishment: React.ReactNode[] = [];
  user.punishments.forEach((punishment) => {
    {
      Array.from({ length: punishment.amount }, (_, i) =>
        totalPunishment.push(
          <span key={`${punishment.punishment_id}/${i}`} className="text-4xl">
            {punishment.punishment_type_id === 1 && <span>🍺</span>}
            {punishment.punishment_type_id === 2 && <span>🍷</span>}
          </span>
        )
      );
    }
  });

  return (
    <React.Fragment>
      <tr
        className={`cursor-pointer border-b font-thin hover:bg-gray-100 ${
          showPunishments ? "bg-gray-50" : "bg-white"
        }`}
        onClick={togglePunishments}
      >
        <td className="text-left font-normal">
          <p className="m-4">
            <span className="block">
              <span className="text-lg">👤</span> {user.first_name}{" "}
              {user.last_name}
            </span>
          </p>
        </td>
        <td>
          <div className="mr-8 text-right">
            <div className="max-w-xs float-right py-4">
              {totalPunishment.map((punishment) => punishment)}
            </div>
          </div>
        </td>
      </tr>
      {showPunishments && <PunishmentList user={user} />}
    </React.Fragment>
  );
};
