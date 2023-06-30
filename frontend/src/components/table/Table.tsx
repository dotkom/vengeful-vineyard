import { mockData } from "../../helpers/tmpMock";
import { TableItem } from "./TableItem";

export const Table = () => (
  <ul
    role="list"
    className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl max-w-5xl md:m-auto"
  >
    {mockData.results.map((user) => (
      <TableItem user={user} key={user.user_id} />
    ))}
  </ul>
);
