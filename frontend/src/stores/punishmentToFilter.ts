import { writable } from "svelte/store";
import type { PunishmentType } from "../types";

const defaultPunishments: PunishmentType[] = [
  { imageurl: "assets/beerOutlined.svg", value: 33, name: "Øl", id: 0 },
  { imageurl: "assets/wineOutlined.svg", value: 100, name: "Vin", id: 1 },
  { imageurl: "assets/spiritOutlined.svg", value: 500, name: "Sprit", id: 2 },
  { imageurl: "assets/wineOutlined.svg", value: 15, name: "Vaffel", id: 3 },
];

export const punishmentsToFilter = writable(defaultPunishments);
