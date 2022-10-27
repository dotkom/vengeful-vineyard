import type { OWGroup } from 'src/lib/types'
import { writable } from 'svelte/store'

export const OWgroups = writable<OWGroup[]>(JSON.parse(localStorage.getItem('OWgroups')))

OWgroups.subscribe(value => (localStorage.OWgroups = JSON.stringify(value)))
