import type { PunishmentType, User } from './types'

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
  return punishmentTypes.filter(p => p.punishment_type_id == punishmentTypeId)[0].logo_url
}

/**
 * Formats the given time in YYYY-MM-DD format.
 * @param givenTime in ISO format
 * @returns Given time as string.
 */
export const formatGivenTime = (givenTime: string) => {
  return givenTime.split('T')[0]
}

/**
 * Returns the last punished date from a given user
 * @param user user
 * @returns date as string YYYY-MM-DD, 'No date' if user is undefined or date error.
 */
export const getLastPunishedDate = (user?: User): string => {
  if (!user) {
    return 'No date'
  }
  try {
    return user.punishments[user.punishments.length - 1].created_time.split('T')[0]
  } catch (TypeError) {
    return 'No date'
  }
}

export const shouldDisplay = (
  dateGiven: Date,
  onlyShowAfterDate: Date,
  onlyShowBeforeDate: Date
): boolean => {
  return (
    (dateGiven.getTime() >= onlyShowAfterDate.getTime() &&
      new Date(dateGiven).getTime() <= onlyShowBeforeDate.getTime()) ||
    (new Date(dateGiven).getDate() == onlyShowAfterDate.getDate() &&
      new Date(dateGiven).getMonth() == onlyShowAfterDate.getMonth() &&
      new Date(dateGiven).getFullYear() == onlyShowAfterDate.getFullYear()) ||
    (new Date(dateGiven).getDate() == onlyShowBeforeDate.getDate() &&
      new Date(dateGiven).getMonth() == onlyShowBeforeDate.getMonth() &&
      new Date(dateGiven).getFullYear() == onlyShowBeforeDate.getFullYear())
  )
}
