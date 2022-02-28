<script lang="ts">
  import type { Punishment, PunishmentType, User } from "src/types";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { filteredUsers, showPaid, users } from "../../stores/users";
  import { group } from "../../stores/groups";
  import { onlyShowAfterDate } from "../../stores/users";

  export let p_types: PunishmentType[];

  export let row;

  const getUrl = (p_type: number) => {
    return p_types.filter((p) => p.punishment_type_id === p_type)[0].logo_url;
  };
</script>

<div class="flex">
  {#if row.user.punishments}
    {#each row.user.punishments
      .filter((pun) => $punishmentsToFilter
          .map((pun) => pun.punishment_type_id)
          .includes(pun.punishment_type))
      .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
      .filter((pun) => new Date(pun.created_time).getTime() >= $onlyShowAfterDate.getTime() || (new Date(pun.created_time).getDate() == $onlyShowAfterDate.getDate() && new Date(pun.created_time).getMonth() == $onlyShowAfterDate.getMonth() && new Date(pun.created_time).getFullYear() == $onlyShowAfterDate.getFullYear())) as punishment}
      <img
        class="icon"
        alt="punishment"
        src="{getUrl(punishment.punishment_type)}"
      />
    {/each}
  {:else}
    Ingen straffer
  {/if}
</div>
