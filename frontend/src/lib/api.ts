import type {
  CreatePunishment,
  Group,
  User,
  OWGroup,
  CreateCustomPunishment
} from './types'

async function authorizedRequest(
  method: string,
  url: string,
  authToken: string,
  body?: any
) {
  const headers: HeadersInit = new Headers()
  headers.set('Authorization', `Bearer ${authToken}`)

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  const res = await fetch(url, {
    method: method,
    headers: headers,
    body: body
  })
  return res
}

export async function getGroup(group_id: number): Promise<Group> {
  const res = await fetch(`http://localhost:8000/group/${group_id}`)
  const json = await res.json()
  return json
}

export async function getGroupUsers(group_id: number): Promise<User[]> {
  const res = await fetch(`http://localhost:8000/group/${group_id}/users`)
  const json = await res.json()
  return json
}

export async function getUser(user_id: number): Promise<User> {
  const res = await fetch(`http://localhost:8000/user/${user_id}`)
  const json = await res.json()
  return json
}

export async function postCustomPunishmentType(
  id: number,
  customPunishment: CreateCustomPunishment,
  authToken: string
) {
  const res = await authorizedRequest(
    'POST',
    `http://localhost:8000/group/${id}/punishmentType`,
    authToken,
    customPunishment
  )
  const json = await res.json()
  return json
}

export async function addPunishmentToUser(
  punishment: CreatePunishment,
  group_id: number,
  user_id: number,
  authToken: string
) {
  const res = await authorizedRequest(
    'POST',
    `http://localhost:8000/group/${group_id}/user/${user_id}/punishment`,
    authToken,
    [punishment]
  )
  const json = await res.json()
  return json
}

export async function deletePunishment(id: number, authToken: string) {
  await authorizedRequest('DELETE', `http://localhost:8000/punishment/${id}`, authToken)
}

export async function postValidatePunishment(id: number, authToken: string) {
  const res = await authorizedRequest(
    'POST',
    `http://localhost:8000/punishment/${id}/verify`,
    authToken
  )
  const json = await res.json()
  return json
}

export async function getMyOnlineGroups(authToken: string): Promise<OWGroup[]> {
  const res = await authorizedRequest('GET', 'http://localhost:8000/group/me', authToken)
  const json = await res.json()
  return json
}
