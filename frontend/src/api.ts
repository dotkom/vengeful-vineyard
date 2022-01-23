import type { CreatePunishment, Group, User } from "./types";
import { accessToken } from "@dopry/svelte-oidc";

export async function getGroups() {
  const res = await fetch("http://localhost:8080/group");
  const json = await res.json();
  return json;
}

export async function getGroup(group_id: number): Promise<Group> {
  const res = await fetch(`http://localhost:8000/group/${group_id}`);
  const json = await res.json();
  return json;
}

export async function getUser(user_id: number): Promise<User> {
  const res = await fetch(`http://localhost:8000/user/${user_id}`);
  const json = await res.json();
  return json;
}

export async function postGroup(name: string, rules: string) {
  const res = await fetch("http://localhost:8000/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      rules,
    }),
  });
  const json = await res.json();
  return json;
}

export async function postPunishment(punishment: CreatePunishment) {
  const res = await fetch("http://localhost:8080/punishment", {
    method: "POST",
    body: JSON.stringify(punishment),
  });
  const json = await res.json();
  return json;
}

export async function deletePunishment(id: number) {
  const res = await fetch(
    "http://localhost:8080/validatePunishment/" + id.toString(),
    {
      method: "DELETE",
    }
  );
  return res;
}

export async function postValidatePunishment(id: number) {
  const res = await fetch(
    "http://localhost:8080/validatePunishment/" + id.toString(),
    {
      method: "POST",
    }
  );
  return res;
}

async function authorizedOnlineFetch(url: string, token: string) {
  var headers = {};
  var request_options = {};
  headers["Authorization"] = `Bearer ${token}`;
  request_options["headers"] = headers;
  const res = await fetch(url, request_options);
  var response = await res.json();
  return response;
}

export async function getOnlineProfile(token: string) {
  var endpoint = "https://online.ntnu.no/api/v1/profile/";
  var response = await authorizedOnlineFetch(endpoint, token);
  return response;
}

export async function getMyOnlineGroups(
  token: string,
  id: number
): Promise<OWGroup[]> {
  var endpoint = `https://online.ntnu.no/api/v1/group/online-groups/?members__user=${id}`;
  var groups = await authorizedOnlineFetch(endpoint, token);
  return groups["results"];
}

interface OWGroup {
  group_type: string;
  id: number;
  image: string;
  members: [];
  name_short: string;
}
