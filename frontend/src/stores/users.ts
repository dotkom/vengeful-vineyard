import { writable, derived } from "svelte/store";
import type { User } from "../lib/types";

function getRawUsers(): string {
  const rawUsers = localStorage.getItem("users");
  return rawUsers !== "null" ? rawUsers : "[]";
}

export const term = writable<string>("");
export const users = writable<User[]>(JSON.parse(getRawUsers()));
export const showInactive = writable<boolean>();
export const showPaid = writable<boolean>();
export const onlyShowAfterDate = writable<Date>();
export const onlyShowBeforeDate = writable<Date>();

export const filteredUsers = derived(
  [term, users, showInactive],
  ([$term, $users, $showInactive]) =>
    $users
      ?.filter((user) => ($showInactive ? user : user.active))
      ?.filter(
        (user) =>
          user.first_name
            .toLocaleLowerCase()
            .includes($term.toLocaleLowerCase()) ||
          user.last_name
            .toLocaleLowerCase()
            .includes($term.toLocaleLowerCase()) ||
          (
            user.first_name.toLocaleLowerCase() +
            " " +
            user.last_name.toLocaleLowerCase()
          ).includes($term.toLocaleLowerCase())
      )
);

users.subscribe((value) => (localStorage.users = JSON.stringify(value)));
