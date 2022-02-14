import { writable } from "svelte/store";
import type { User, Group } from "../types";

export const members: User[] = [
  {
    user_id: 1,
    first_name: "noen",
    last_name: "noensen",
    email: "kldjlksa@klsjda.dn",
    active: true,
    punishments: [
      {
        punishment_type: 1,
        reason: "vin",
        amount: 1,
        punishment_id: 1,
        created_time: "2022-02-13T18:54:50",
        verified_time: null,
        verified_by: null,
      },
      {
        punishment_type: 2,
        reason: "sprit",
        amount: 1,
        punishment_id: 2,
        created_time: "2022-02-13T18:54:55",
        verified_time: null,
        verified_by: null,
      },
      {
        punishment_type: 3,
        reason: "vaffel",
        amount: 1,
        punishment_id: 3,
        created_time: "2022-02-13T18:55:03",
        verified_time: null,
        verified_by: null,
      },
    ],
  },
  {
    user_id: 2,
    first_name: "Vigdis-Irene",
    last_name: "Steinsund",
    email: "vigdis.steinsund@hotmail.com",
    active: true,
    punishments: [
      {
        punishment_type: 1,
        reason: "string",
        amount: 1,
        punishment_id: 4,
        created_time: "2022-02-13T18:54:50",
        verified_time: null,
        verified_by: null,
      },
    ],
  },
];

const defaultGroup: Group = {
  group_id: 0,
  name: "placeholder",
  rules: "",
  logoUrl: "",
  members: members,
  punishment_types: [
    { imageurl: "assets/beerOutlined.svg", value: 33, name: "Øl", id: 4 },
    { imageurl: "assets/wineOutlined.svg", value: 100, name: "Vin", id: 5 },
    { imageurl: "assets/spiritOutlined.svg", value: 500, name: "Sprit", id: 6 },
    { imageurl: "assets/wineOutlined.svg", value: 15, name: "Vaffel", id: 7 },
  ],
};

//export const group = writable(defaultGroup);

export const group = writable<Group>(JSON.parse(localStorage.getItem("group")));

group.subscribe((value) => (localStorage.group = JSON.stringify(value)));

const initial = { currentGroup: "placeholder", groups: [group] };
const GroupStore = writable(initial);
export default GroupStore;
