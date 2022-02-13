import { writable } from "svelte/store";
import type { User, Group } from "../types";

export const members: User[] = [
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

export const group: Group = {
  id: 0,
  name: "placeholder",
  rulesUrl: "",
  logoUrl: "",
  members: members,
  punishmentTypes: [
    { imageurl: "assets/beerOutlined.svg", value: 33, name: "Øl", id: 0 },
    { imageurl: "assets/wineOutlined.svg", value: 100, name: "Vin", id: 1 },
    { imageurl: "assets/spiritOutlined.svg", value: 500, name: "Sprit", id: 2 },
    { imageurl: "assets/wineOutlined.svg", value: 15, name: "Vaffel", id: 3 },
  ],
};
const initial = { currentGroup: "placeholder", groups: [group] };
const GroupStore = writable(initial);
export default GroupStore;
