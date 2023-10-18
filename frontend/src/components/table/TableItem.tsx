import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion/Accordion";
import {
  Group,
  GroupUser,
  LeaderboardPunishment,
  LeaderboardUser,
  PunishmentType,
} from "../../helpers/types";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

import { PunishmentList } from "./punishment/PunishmentList";
import { textToEmoji } from "../../helpers/emojies";

interface TableItemProps {
  groupUser?: GroupUser | undefined;
  leaderboardUser?: LeaderboardUser | undefined;
  punishmentTypes: PunishmentType[];
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const TableItem = ({
  groupUser,
  leaderboardUser,
  punishmentTypes = [],
  dataRefetch,
}: TableItemProps) => {
  const user = groupUser ?? leaderboardUser;
  if (user === undefined) {
    return <p>user is undefined</p>;
  }

  const totalPunishment: React.ReactNode[] = [];
  const punishmentTypeMap = new Map<number, PunishmentType>();

  if (punishmentTypes !== undefined) {
    punishmentTypes.forEach((type) => {
      punishmentTypeMap.set(type.punishment_type_id, type);
    });
  }

  function isGroupUser(user: GroupUser | LeaderboardUser): user is GroupUser {
    return (user as GroupUser).total_paid_amount !== undefined;
  }

  user.punishments.forEach((punishment) => {
    {
      Array.from({ length: punishment.amount }, (_, i) => {
        let name: string;
        let value: number;
        let logoUrl: string;

        if (isGroupUser(user)) {
          const punishmentType = punishmentTypeMap.get(
            punishment.punishment_type_id
          );

          name = punishmentType?.name ?? "N/A";
          value = punishmentType?.value ?? 0;
          logoUrl = punishmentType?.logo_url ?? "?";
        } else {
          const innerPunishment = punishment as LeaderboardPunishment;
          name = innerPunishment.punishment_type.name;
          value = innerPunishment.punishment_type.value;
          logoUrl = innerPunishment.punishment_type.logo_url;
        }

        totalPunishment.push(
          <span
            key={`${punishment.punishment_id}/${i}`}
            className="text-lg"
            title={`${name} (${value}kr)`}
          >
            <span>{logoUrl}</span>
          </span>
        );
      });
    }
  });

  return (
    <AccordionItem value={user.user_id}>
      <AccordionTrigger className="relative flex cursor-pointer justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6">
        <div className="flex items-center gap-x-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 align-middle text-4xl">
            {textToEmoji(user.first_name + user.last_name)}
          </span>
          <p
            className="w-48 overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm font-semibold leading-6 text-gray-900"
            title={`${user.first_name} ${user.last_name}`}
          >
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
          groupUser={groupUser}
          leaderboardUser={leaderboardUser}
          punishmentTypes={punishmentTypes ?? []}
          dataRefetch={dataRefetch}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
