import { GroupUser } from "../../helpers/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion/Accordion";
import { textToEmoji } from "../../helpers/emojies";
import { PunishmentList } from "./punishment/PunishmentList";

interface TableItemProps {
  user: GroupUser;
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
      <AccordionTrigger className="relative flex cursor-pointer justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
        <div className="flex items-center gap-x-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 align-middle text-4xl">
            {textToEmoji(user.first_name + user.last_name)}
          </span>
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
