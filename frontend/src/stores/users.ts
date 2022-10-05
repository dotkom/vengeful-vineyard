import { writable, derived } from "svelte/store";
import type { User } from "../types";

export const term = writable<string>("");
export const users = writable<User[]>(
  JSON.parse(localStorage.getItem("users"))
);

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
          user.first_name.toLocaleLowerCase().includes($term) ||
          user.last_name.toLocaleLowerCase().includes($term)
      )
);

users.subscribe((value) => (localStorage.users = JSON.stringify(value)));
