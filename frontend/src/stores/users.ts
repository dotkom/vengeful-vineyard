import { writable } from "svelte/store";
import type { User } from "../types";

const defaultusers: User[] = [
  {
    user_id: 1,
    first_name: "noen",
    last_name: "noensen",
    email: "kldjlksa@klsjda.dn",
    active: true,
    punishments: [],
  },
  {
    user_id: 2,
    first_name: "Vigdis-Irene",
    last_name: "Steinsund",
    email: "vigdis.steinsund@hotmail.com",
    active: true,
    punishments: [],
  },
];

export const users = writable(defaultusers);
