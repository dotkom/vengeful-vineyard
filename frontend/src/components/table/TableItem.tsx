import { LeaderboardUser } from "../../helpers/types";
import { PunishmentList } from "../leaderboard/PunishmentList";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion/Accordion";

interface TableItemProps {
  user: LeaderboardUser;
}

export const TableItem = ({ user }: TableItemProps) => {
  const totalPunishment: React.ReactNode[] = [];
  user.punishments.forEach((punishment) => {
    {
      Array.from({ length: punishment.amount }, (_, i) =>
        totalPunishment.push(
          <span key={`${punishment.punishment_id}/${i}`} className="text-lg">
            {punishment.punishment_type_id === 1 && <span>🍺</span>}
            {punishment.punishment_type_id === 2 && <span>🍷</span>}
          </span>
        )
      );
    }
  });

  return (
    <AccordionItem value={user.user_id}>
      <AccordionTrigger className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 cursor-pointer sm:px-6">
        <div className="flex gap-x-2 items-center">
          <img
            className="h-12 w-12 flex-none rounded-full bg-gray-50"
            src="https://media.licdn.com/dms/image/D4E03AQGhozXJkpG0JA/profile-displayphoto-shrink_800_800/0/1664545360034?e=2147483647&v=beta&t=AERDN5WsH6qFhpnUjD7dovDOtsOYJ7mQ0g0aXijSFQw"
            alt=""
          />
          <p className="text-sm font-semibold leading-6 text-gray-900">
            {user.first_name} {user.last_name}
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="hidden sm:flex sm:flex-col sm:items-end">
            <p className="max-w-sm text-right">
              {totalPunishment.map((punishment) => punishment)}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <PunishmentList user={user} />
      </AccordionContent>
    </AccordionItem>
  );
};
