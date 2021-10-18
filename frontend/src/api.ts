import type { CreatePunishment } from "./types";
import { accessToken } from "@dopry/svelte-oidc";

export async function getGroups() {
  const res = await fetch("http://localhost:8080/group");
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
  return await res.json()["results"];
}

export async function getOnlineProfile(token: string) {
  var endpoint = "https://online.ntnu.no/api/v1/profile/";
  return await authorizedOnlineFetch(endpoint, token);
}

interface OWGroup {
  name_short: string;
}

export async function getMyOnlineGroups(token: string, id: number): OWGroup[] {
  var endpoint = `https://online.ntnu.no/api/v1/group/online-groups/?members__user=${id}`;
  return await authorizedOnlineFetch(endpoint, token);
}
