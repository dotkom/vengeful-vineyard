<script lang="ts">
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";

  import type { User, PunishmentType } from "../../lib/types";
  import { getLastPunishedDate, getLogoUrl } from "../../lib/functions"
  import PunishmentInfo from "./PunishmentInfo.svelte";
  export let user: User | undefined;
  export let punishmentTypes: PunishmentType[];

  /**
   * Map all punishments with type id to amount
   * // TODO fix types here
   */
  const mapPunishments = (): {} | undefined => {
    if (!user) {
      console.error("User is undefined");
      return;
    }
    //TODO remove an icon here when a punishment is removed
    let allPunishments = {};
    user.punishments
      .filter((pun) =>
        $punishmentsToFilter
          .map((pun) => pun.punishment_type_id)
          .includes(pun.punishment_type_id)
      )
      .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
      .map((punishment) => {
        //@ts-ignore
        allPunishments[punishment.punishment_type_id] =
          //@ts-ignore
          (allPunishments[punishment.punishment_type_id] || 0) + punishment.amount;
      });

    return allPunishments;
  };

  $: p_dictionary = mapPunishments();
  

</script>

<div class="accordion_text collapse-title text-xl font-medium">
  <div class="name">{user?.first_name} {user?.last_name}</div>
  <div class="icons">
    {#each Object.entries(p_dictionary) as [type, amount]}
      {#each Array(amount) as _}
        <img class="icon" alt="punishment" src="{getLogoUrl(Number(type), punishmentTypes)}" />
      {/each}
    {:else}Ingen straffer{/each}
  </div>
  <div>{getLastPunishedDate(user)}</div>
</div>
<div class="collapse-content">
  <PunishmentInfo
    totalSum="{undefined}"
    punishmentTypes="{punishmentTypes}"
    user="{user}"
    punishments="{user ? user.punishments
      .filter((pun) =>
        $punishmentsToFilter
          .map((pun) => pun.punishment_type_id)
          .includes(pun.punishment_type_id)
      )
      .filter((pun) => ($showPaid ? pun : pun.verified_time === null)) : []}"
  />
</div>

<style lang="postcss">
  .accordion_text {
    @apply flex flex-row justify-between text-gray-500;
  }
  .name {
    @apply max-w-xs;
    min-width: 7em;
  }

  .icon {
    @apply h-6;
  }

  .icons {
    @apply flex justify-center;
  }
</style>
