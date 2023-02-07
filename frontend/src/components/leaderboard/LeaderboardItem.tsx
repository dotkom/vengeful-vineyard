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
        className="font-thin hover:bg-gray-100 cursor-pointer border-b"
        onClick={togglePunishments}
      >
        <th className="text-left flex items-center gap-2 text-slate-800">
          <figure className="w-8 h-8 rounded-full bg-pink-300 my-4 ml-8" />
          {user.first_name} {user.last_name}
        </th>
        <th>
          🍺{user.punishments.length}
        </th>
        <th>🍷0</th>
      </tr>
      {showPunishments && <PunishmentList punishments={user.punishments} />}
    </React.Fragment>
  );
};
