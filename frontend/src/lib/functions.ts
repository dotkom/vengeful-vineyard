import type { Writable } from "svelte/store";
import type { Group, Punishment, PunishmentType } from "./types";

/**
 * Creates a new object that stores punishment ids and punishment values.
 * @returns a dictionary-like object where punishment type id are the keys, and punishment values are values.
 */
export const mapTypes = (group: Group): object => {
  let mappedTypes = {};
  group.punishment_types.map(
    (p: PunishmentType) => (mappedTypes[p.punishment_type_id] = p.value)
  );
  return mappedTypes;
};

/**
 * Calculates the total sum in NOK of punishments
 * @returns the total sum as number
 */
export const calculateSum = (
  punishments: Punishment[],
  group: Group | Writable<Group>
): number => {
  const g = group as Group;
  const dict = mapTypes(g);
  let sum: number = 0;
  punishments.forEach((punishment) => {
    sum += dict[punishment.punishment_type] * punishment.amount;
  });

  return sum;
};
