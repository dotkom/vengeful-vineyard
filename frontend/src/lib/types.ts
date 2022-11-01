/**
 * Interface for punishments that are created in the Frontend
 */
export interface CreatePunishment {
  punishment_type_id: number
  reason: string
  amount: number
}

/**
 * Interface for punishments.
 */
export interface Punishment extends CreatePunishment {
  punishment_id: number
  created_time: string
  verified_time: string | null
  verified_by: string | null
  created_by: string | null
}

/**
 * Interface for the creation of custom punishments within groups to be used in requests
 */
export interface CreateCustomPunishment {
  name: string | null
  value: number
  logo_url: string
}

/**
 * Interface for custom Punishment types.
 */
export interface PunishmentType {
  name: string
  value: number
  logo_url: string
  punishment_type_id: number
}

/**
 * Interface for users in the app.
 */
export interface User {
  user_id: number
  email: string
  first_name: string
  last_name: string
  punishments: Punishment[]
  active: boolean
}

/**
 * Interface for groups in the app.
 */
export interface Group {
  group_id: number
  name: string
  rules: string
  logo_url: string
  punishment_types: PunishmentType[]
  members: User[]
}

/**
 * Interface for the logos fetched through OW.
 */
export interface LogoObject {
  description: string
  id: number
  lg: string
  md: string
  name: string
  original: string
  photographer: string
  preset: string
  sm: string
  tags: string[]
  thumb: string
  timestamp: string
  wide: string
  xs: string
}

/**
 * Interface for groups fetched from OW.
 */
export interface OWGroup {
  group_type: string
  id: number
  image: LogoObject
  members: []
  name_short: string
}
