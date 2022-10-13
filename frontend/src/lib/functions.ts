import type { PunishmentType } from "./types";

/**
 * Gives the logo url for a punishment type in an array.
 * @param punishmentTypeId Id as number for the punishment type
 * @param punishmentTypes PunishmentType array with punishment types
 * @returns the logo URL as string
 */
export const getLogoUrl = (
  punishmentTypeId: number,
  punishmentTypes: PunishmentType[]
): string => {
  return punishmentTypes.filter(
    (p) => p.punishment_type_id == punishmentTypeId
  )[0].logo_url;
};

/**
 * Formats the given time in YYYY-MM-DD format.
 * @param givenTime in ISO format
 * @returns Given time as string.
 */
export const formatGivenTime = (givenTime: String) => {
  return givenTime.split("T")[0];
};
