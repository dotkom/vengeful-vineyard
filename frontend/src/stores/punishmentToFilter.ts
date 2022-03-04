import { writable } from "svelte/store";
import type { PunishmentType } from "../types";

export const punishmentsToFilter = writable<PunishmentType[]>(
  JSON.parse(window.localStorage.getItem("punishmentFilters"))
);

punishmentsToFilter.subscribe(
  (value) => (window.localStorage.punishmentFilters = JSON.stringify(value))
);
