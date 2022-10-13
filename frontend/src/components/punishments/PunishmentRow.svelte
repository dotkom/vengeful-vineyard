<script lang="ts">
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";

  import type { User, PunishmentType } from "src/lib/types";
  import PunishmentInfo from "./PunishmentInfo.svelte";
  export let user: User;
  export let punishmentTypes: PunishmentType[];

  /**
   * Map all punishments with type id to amount
   */
  const mapPunishments = () => {
    //TODO remove an icon here when a punishment is removed
    let allPunishments = {};
    user.punishments
      .filter((pun) =>
        $punishmentsToFilter
          .map((pun) => pun.punishment_type_id)
          .includes(pun.punishment_type)
      )
      .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
      .map((punishment) => {
        allPunishments[punishment.punishment_type] =
          (allPunishments[punishment.punishment_type] || 0) + punishment.amount;
      });

    return allPunishments;
  };

  $: p_dictionary = mapPunishments();

  const getUrl = (p_type: string) => {
    return punishmentTypes.filter(
      (p) => p.punishment_type_id.toString() === p_type
    )[0].logo_url;
  };

  const getLastPunishedDate = (user: User) => {
    let date: String = "";
    try {
      date = user.punishments[user.punishments.length - 1].created_time.split(
        "T"
      )[0];
    } catch (TypeError) {
      return "No date";
    }
    return date;
  };
</script>

<div class="accordion_text collapse-title text-xl font-medium">
  <div class="name">{user.first_name} {user.last_name}</div>
  <div class="icons">
    {#each Object.entries(p_dictionary) as [type, amount]}
      {#each Array(amount) as _}
        <img class="icon" alt="punishment" src="{getUrl(type)}" />
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
    punishments="{user.punishments
      .filter((pun) =>
        $punishmentsToFilter
          .map((pun) => pun.punishment_type_id)
          .includes(pun.punishment_type)
      )
      .filter((pun) => ($showPaid ? pun : pun.verified_time === null))}"
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
