import { writable } from "svelte/store";
import type { User, Group } from "../types";

const members: User[] = [];
const group: Group = {
  id: 0,
  name: "placeholder",
  rulesUrl: "",
  logoUrl: "",
  members: members,
  punishmentTypes: [
    { imageurl: "http://lol.com", value: 33, name: "Øl", id: 0 },
    { imageurl: "http://lol.com", value: 33, name: "Vin", id: 1 },
    { imageurl: "http://lol.com", value: 33, name: "Sprit", id: 2 },
    { imageurl: "http://lol.com", value: 33, name: "Vaffel", id: 3 },
  ],
};
const initial = { currentGroup: "placeholder", groups: [group] };
const GroupStore = writable(initial);
export default GroupStore;
