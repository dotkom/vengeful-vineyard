import { writable } from "svelte/store";
import type { User, Group } from "../types";

const users: User[] = [];
const group: Group = {
  id: 0,
  name: "placeholder",
  rulesUrl: "",
  logoUrl: "",
  users: users,
  validPunishments: ["Øl", "Vin", "Sprit", "Vaffel"],
};
const initial = { currentGroup: "placeholder", groups: [group] };
const GroupStore = writable(initial);
export default GroupStore;
