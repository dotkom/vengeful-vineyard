import React, { useState } from "react";
import { LeaderboardUser } from "../../helpers/types";
import { PunishmentList } from "./PunishmentList";

interface LeaderboardItemProps {
  user: LeaderboardUser;
}

export const LeaderboardItem = ({ user }: LeaderboardItemProps) => {
  const [showPunishments, setShowPunishments] = useState(false);

  const togglePunishments = () => setShowPunishments(!showPunishments);

  return (
    <React.Fragment>
      <tr
        className={`cursor-pointer border-b font-thin hover:bg-gray-100 ${
          showPunishments ? "bg-gray-50" : "bg-white"
        }`}
        onClick={togglePunishments}
      >
        <td className="flex items-center gap-2 text-left font-normal text-slate-800">
          <figure className="my-4 ml-4 h-8 w-8 rounded-full bg-pink-300" />
          {user.first_name} {user.last_name}
        </td>
        <td>
          <div className="mr-8 text-right">
            {Array.from({ length: user.punishments.length }, (_, i) => (
              <span key={i}>🍺</span>
            ))}
          </div>
        </td>
      </tr>
      {showPunishments && <PunishmentList user={user} />}
    </React.Fragment>
  );
};
