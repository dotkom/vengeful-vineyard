import React, { useState } from "react";
import { Person } from "../../helpers/mockData";
import { PunishmentList } from "./PunishmentList";

interface LeaderboardItemProps {
  person: Person;
}

export const LeaderboardItem = ({ person }: LeaderboardItemProps) => {
  const [showPunishments, setShowPunishments] = useState(false);

  const togglePunishments = () => setShowPunishments(!showPunishments);

  return (
    <React.Fragment key={person.name}>
      <tr
        key={person.name}
        className="font-thin hover:bg-gray-100 cursor-pointer border-b"
        onClick={togglePunishments}
      >
        <th className="text-left flex items-center gap-2 text-slate-800">
          <figure className="w-8 h-8 rounded-full bg-pink-300 my-4 ml-8" />
          {person.name}
        </th>
        <th>🍺{person.numOfBeers}</th>
        <th>🍷{person.numOfWine}</th>
      </tr>
      {showPunishments && <PunishmentList punishments={person.punishments} />}
    </React.Fragment>
  );
};
