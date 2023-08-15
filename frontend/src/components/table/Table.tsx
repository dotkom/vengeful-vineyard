import * as Accordion from "@radix-ui/react-accordion";
import { TableItem } from "./TableItem";
import { Leaderboard as LeaderboardType } from "../../helpers/types";
import { SkeletonTableItem } from "./SkeletonTableItem";

interface TableProps {
  data: LeaderboardType | undefined;
  isLoading: boolean;
}

export const Table = ({ data }: TableProps) => (
  <ul role="list">
    <Accordion.Root
      type="single"
      defaultValue="item-1"
      collapsible
      className="max-w-5xl divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:m-auto"
    >
      {data ? (
        <>
          {data.results.map((user) => (
            <TableItem key={user.user_id} user={user} />
          ))}
        </>
      ) : (
        <>
          {[...Array(3)].map((e, i) => (
            <SkeletonTableItem key={i} />
          ))}
        </>
      )}
    </Accordion.Root>
  </ul>
);
