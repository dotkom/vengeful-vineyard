import { Group, GroupUser, PunishmentType } from "./types";

export function sortGroups(groups: Group[]) {
  return groups.sort((a, b) => a.name_short.localeCompare(b.name_short));
}

export function sortGroupUsers(
  members: GroupUser[],
  punishments: PunishmentType[]
) {
  const punishmentMap = new Map(
    punishments.map((p) => [p.punishment_type_id, p])
  );
  return members.sort((a, b) => {
    const count_punishments = (user: GroupUser) =>
      user.punishments.reduce((acc, curr) => acc + curr.amount, 0);
    const value_punishments = (user: GroupUser) =>
      user.punishments.reduce(
        (acc, curr) =>
          acc +
          curr.amount *
            (punishmentMap.get(curr.punishment_type_id)?.value ?? 0),
        0
      );

    const a_punishments = count_punishments(a);
    const b_punishments = count_punishments(b);

    if (a_punishments !== b_punishments) {
      return b_punishments - a_punishments;
    }

    const a_value = value_punishments(a);
    const b_value = value_punishments(b);

    if (a_value !== b_value) {
      return b_value - a_value;
    }

    if (a.first_name === b.first_name) {
      return a.last_name.localeCompare(b.last_name);
    }
    return a.first_name.localeCompare(b.first_name);
  });
}
