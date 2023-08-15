import * as Accordion from "@radix-ui/react-accordion";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { LEADERBOARD_URL } from "../../helpers/api";
import { mockData } from "../../helpers/tmpMock";
import { TableItem } from "./TableItem";
import { Leaderboard as LeaderboardType } from "../../helpers/types";
import { Spinner } from "../spinner";

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
        <div className="flex justify-center p-16 ">
          <Spinner />
        </div>
      )}
    </Accordion.Root>
  </ul>
);
