import { writable } from "svelte/store";
import type { User } from "../types";

// const defaultusers: User[] = [
//   {
//     user_id: 1,
//     first_name: "noen",
//     last_name: "noensen",
//     email: "kldjlksa@klsjda.dn",
//     active: true,
//     punishments: [
//       {
//         punishment_type: 1,
//         reason: "vin",
//         amount: 1,
//         punishment_id: 1,
//         created_time: "2022-02-13T18:54:50",
//         verified_time: null,
//         verified_by: null,
//       },
//       {
//         punishment_type: 2,
//         reason: "sprit",
//         amount: 1,
//         punishment_id: 2,
//         created_time: "2022-02-13T18:54:55",
//         verified_time: null,
//         verified_by: null,
//       },
//       {
//         punishment_type: 3,
//         reason: "vaffel",
//         amount: 1,
//         punishment_id: 3,
//         created_time: "2022-02-13T18:55:03",
//         verified_time: null,
//         verified_by: null,
//       },
//     ],
//   },
//   {
//     user_id: 2,
//     first_name: "Vigdis-Irene",
//     last_name: "Steinsund",
//     email: "vigdis.steinsund@hotmail.com",
//     active: true,
//     punishments: [
//       {
//         punishment_type: 1,
//         reason: "string",
//         amount: 1,
//         punishment_id: 4,
//         created_time: "2022-02-13T18:54:50",
//         verified_time: null,
//         verified_by: null,
//       },
//     ],
//   },
// ];

export const users = writable<User[]>(
  JSON.parse(localStorage.getItem("users"))
);

users.subscribe((value) => (localStorage.users = JSON.stringify(value)));
