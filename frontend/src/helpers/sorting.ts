import {Group, GroupUser, PunishmentType} from "./types";

export function sortGroups(groups: Group[]) {
    return groups.sort((a, b) => a.name_short.localeCompare(b.name_short));
}

export function sortGroupUsers(members: GroupUser[], punishmentTypes: PunishmentType[]) {
    const punishmentTypeMap = punishmentTypes.reduce((acc, curr) => {
        acc[curr.punishment_type_id] = curr;
        return acc;
    }, {} as { [id: number]: PunishmentType });
    return members.sort((a, b) => {
        const punishment_value = (user: GroupUser) => user.punishments.reduce(
            (acc, curr) => acc + punishmentTypeMap[curr.punishment_type_id].value, 0);

        const a_punishment_value = punishment_value(a);
        const b_punishment_value = punishment_value(b);

        if (a_punishment_value !== b_punishment_value) {
            return b_punishment_value - a_punishment_value;
        }

        if (a.first_name === b.first_name) {
            return a.last_name.localeCompare(b.last_name);
        }
        return a.first_name.localeCompare(b.first_name);
    });
}