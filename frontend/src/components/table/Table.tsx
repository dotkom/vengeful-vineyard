import * as Accordion from "@radix-ui/react-accordion";

import { Group, Leaderboard, LeaderboardUser } from "../../helpers/types";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "@tanstack/react-query";

import { SkeletonTableItem } from "./SkeletonTableItem";
import { TableItem } from "./TableItem";
import { useEffect, useState } from "react";

interface TableProps {
  groupData?: Group | undefined;
  leaderboardData?: Leaderboard | undefined;
  isLoading: boolean;
  dataRefetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<any, unknown>>;
}

const SearchBar = ({
  setSearchTerm,
}: {
  setSearchTerm: (value: string) => void;
}) => {
  return (
    <input
      type="text"
      placeholder="Search..."
      onChange={(event) => setSearchTerm(event.target.value)}
      className="lg:w-[64rem] w-full bg-white sm:rounded-lg shadow-sm block mx-auto my-4 border-gray-900/25 focus:outline-none"
    />
  );
};

export const Table = ({
  groupData,
  leaderboardData,
  dataRefetch,
}: TableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(groupData);

  useEffect(() => {
    if (groupData && searchTerm !== "") {
      setFilteredData({
        ...groupData,
        members: groupData.members.filter(
          (user) =>
            user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      });
    } else {
      setFilteredData(groupData);
    }
  }, [groupData, searchTerm]);

  return (
    <ul role="list">
      <SearchBar setSearchTerm={setSearchTerm} />
      <Accordion.Root
        type="single"
        defaultValue="item-1"
        collapsible
        className="max-w-5xl divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:m-auto"
      >
        {filteredData ? (
          <>
            {filteredData.members.map((user) => (
              <TableItem
                key={user.user_id}
                groupUser={user}
                punishmentTypes={filteredData.punishment_types}
                dataRefetch={dataRefetch}
              />
            ))}
          </>
        ) : (
          <>
            {leaderboardData ? (
              <>
                {leaderboardData.results.map((user, i) => (
                  <TableItem
                    key={user.user_id}
                    punishmentTypes={[]}
                    leaderboardUser={user}
                    dataRefetch={dataRefetch}
                    i={i}
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
};
