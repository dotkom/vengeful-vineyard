import type { CreatePunishment } from './types';

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
