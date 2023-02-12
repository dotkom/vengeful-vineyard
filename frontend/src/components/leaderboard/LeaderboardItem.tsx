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
        className={`font-thin hover:bg-gray-100 cursor-pointer border-b ${
          showPunishments ? "bg-gray-50" : "bg-white"
        }`}
        onClick={togglePunishments}
      >
        <th className="text-left flex items-center gap-2 text-slate-800">
          <figure className="w-8 h-8 rounded-full bg-pink-300 my-4 ml-4" />
          {user.first_name} {user.last_name}
        </th>
        <th>
          <div className="mr-4">
            {Array.from({ length: user.punishments.length }, (_, i) => (
              <span key={i}>🍺</span>
            ))}
          </div>
        </th>
      </tr>
      {showPunishments && <PunishmentList user={user} />}
    </React.Fragment>
  );
};
