import { writable } from 'svelte/store'
import type { PunishmentType } from '../lib/types'

function getRawPunishmentFilters(): string {
  const rawPunishmentFilters = window.localStorage.getItem('punishmentFilters')
  return rawPunishmentFilters === 'null' || rawPunishmentFilters == 'undefined'
    ? '[]'
    : rawPunishmentFilters
}

export const punishmentsToFilter = writable<PunishmentType[]>(
  JSON.parse(getRawPunishmentFilters())
)

punishmentsToFilter.subscribe(
  value => (window.localStorage.punishmentFilters = JSON.stringify(value))
)
