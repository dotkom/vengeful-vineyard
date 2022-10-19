import type { CreatePunishment, Group, User, OWGroup } from './types'
import * as http from 'http'

export async function getGroups() {
  const res = await fetch('http://localhost:8000/group')
  const json = await res.json()
  return json
}

export async function getGroup(group_id: number): Promise<Group> {
  const res = await fetch(`http://localhost:8000/group/${group_id}`)
  const json = await res.json()
  return json
}

export async function getGroupUser(group_id: number, user_id: number): Promise<User> {
  const res = await fetch(`http://localhost:8000/group/${group_id}/user/${user_id}`)
  const json = await res.json()
  return json
}

export async function getUser(user_id: number): Promise<User> {
  const res = await fetch(`http://localhost:8000/user/${user_id}`)
  const json = await res.json()
  return json
}

export async function postGroup(name: string, rules: string) {
  const res = await fetch('http://localhost:8000/group', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      rules
    })
  })
  const json = await res.json()
  return json
}

export async function addPunishmentToUser(
  punishment: CreatePunishment,
  group_id: number,
  user_id: number
) {
  const res = await fetch(
    `http://localhost:8000/group/${group_id}/user/${user_id}/punishment`,
    {
      headers: new Headers({ 'content-type': 'application/json' }),
      method: 'POST',
      body: JSON.stringify([punishment])
    }
  )
  const json = await res.json()
  return json
}

export async function deletePunishment(id: number) {
  const res = await fetch('http://localhost:8000/punishment/' + id.toString(), {
    method: 'DELETE'
  })
  return res
}

export async function postValidatePunishment(id: number) {
  const res = await fetch(`http://localhost:8000/punishment/${id}/verify`, {
    method: 'POST'
  })
  return res
}

async function authorizedOnlineFetch(url: string, token: string) {
  const headers: { [header: string]: string | string[] | undefined } = {}
  const request_options: { [key: string]: {} } = {}
  headers['Authorization'] = `Bearer ${token}`
  request_options['headers'] = headers
  const res = await fetch(url, request_options)
  const response = await res.json()
  return response
}

export async function getOnlineProfile(token: string) {
  const endpoint = 'https://old.online.ntnu.no/api/v1/profile/'
  const response = await authorizedOnlineFetch(endpoint, token)
  return response
}

export async function getMyOnlineGroups(token: string, id: number): Promise<OWGroup[]> {
  const endpoint = `https://old.online.ntnu.no/api/v1/group/online-groups/?members__user=${id}`
  const groups = await authorizedOnlineFetch(endpoint, token)
  return groups['results']
}
