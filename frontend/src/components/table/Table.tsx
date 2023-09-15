import * as Accordion from "@radix-ui/react-accordion";
import { TableItem } from "./TableItem";
import { Group, Leaderboard, LeaderboardUser } from "../../helpers/types";
import { SkeletonTableItem } from "./SkeletonTableItem";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

interface TableProps {
  groupData?: Group | undefined;
  leaderboardData?: Leaderboard | undefined;
  isLoading: boolean;
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

export const Table = ({
  groupData = undefined,
  leaderboardData = undefined,
  dataRefetch,
}: TableProps) => (
  <ul role="list">
    <Accordion.Root
      type="single"
      defaultValue="item-1"
      collapsible
      className="max-w-5xl divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:m-auto"
    >
      {groupData ? (
        <>
          {groupData.members.map((user) => (
            <TableItem
              key={user.user_id}
              user={user}
              dataRefetch={dataRefetch}
            />
          ))}
        </>
      ) : (
        <>
          {leaderboardData ? (
            <>
              {leaderboardData.results.map((user) => (
                <TableItem
                  key={user.user_id}
                  user={user}
                  dataRefetch={dataRefetch}
                />
              ))}
            </>
          ) : (
            <>
              {[...Array(3)].map((e, i) => (
                <SkeletonTableItem key={i} />
              ))}
            </>
          )}
        </>
      )}
    </Accordion.Root>
  </ul>
);
