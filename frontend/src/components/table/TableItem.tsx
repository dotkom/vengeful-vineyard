import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion/Accordion";
import { Group, GroupUser, PunishmentType } from "../../helpers/types";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

import { PunishmentList } from "./punishment/PunishmentList";
import { textToEmoji } from "../../helpers/emojies";

interface TableItemProps {
  user: GroupUser;
  punishmentTypes?: PunishmentType[];
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const TableItem = ({
  user,
  punishmentTypes,
  dataRefetch,
}: TableItemProps) => {
  const totalPunishment: React.ReactNode[] = [];
  const punishmentTypeMap = new Map<number, PunishmentType>();

  if (punishmentTypes !== undefined) {
    punishmentTypes.forEach((type) => {
      punishmentTypeMap.set(type.punishment_type_id, type);
    });
  }

  user.punishments.forEach((punishment) => {
    {
      Array.from({ length: punishment.amount }, (_, i) =>
        totalPunishment.push(
          <span
            key={`${punishment.punishment_id}/${i}`}
            className="text-lg"
            title={`${
              punishmentTypeMap.get(punishment.punishment_type_id)?.name
            } (${
              punishmentTypeMap.get(punishment.punishment_type_id)?.value
            }kr)`}
          >
            <span>
              {punishmentTypeMap.get(punishment.punishment_type_id)?.logo_url}
            </span>
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
        <PunishmentList
          user={user}
          punishmentTypes={punishmentTypes ?? []}
          dataRefetch={dataRefetch}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
