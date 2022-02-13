<script lang="ts">
  import type { User, Punishment, PunishmentType } from "src/types";
  import PunishmentInfo from "./PunishmentInfo.svelte";
  export let user: User;
  export let p_types: PunishmentType[];

  // Map all punishments with type to amount
  let allPunishments = {};
  user.punishments.map((punishment) => {
    allPunishments[punishment.punishment_type] = punishment.amount;
  });

  export function getUrl(p_type: string) {
    return p_types.filter((p) => p.punishment_type_id.toString() === p_type)[0]
      .logo_url;
  }

  const getLastPunishedDate = (user: User) => {
    let date: String = "";
    try {
      date =
        user.punishments[user.punishments.length - 1].created_time.split(
          "T"
        )[0];
    } catch (TypeError) {
      return "No date";
    }
    return date;
  };

  const getPunishmentAmount = (user: User) => {
    let amount: number = null;
    let punishments: Punishment[] = user.punishments;
    for (let i = 0; i < punishments.length; i++) {
      amount += punishments[i].amount;
    }
    return amount;
  };

  $: totalSum = calculateSum(user);

  const calculateSum = (user: User) => {
    let sum: number = 0;
    let punishments: Punishment[] = user.punishments;

    for (let i = 0; i < punishments.length; i++) {
      for (let j = 0; j < p_types.length; j++) {
        if (p_types[j].punishment_type_id == punishments[i].punishment_type) {
          let value = p_types[j].value;
          sum += value * punishments[i].amount;
        }
      }
      return sum;
    }
  };
</script>

<div class="accordion_text collapse-title text-xl font-medium">
  <div class="name">{user.first_name} {user.last_name}</div>
  <div class="icons">
    {#each Object.entries(allPunishments) as [type, amount]}
      {#each Array(amount) as _}
        <img class="icon" alt="punishment" src="{getUrl(type)}" />
      {/each}
    {:else}
      Ingen straffer
    {/each}
  </div>
  <div>
    {getLastPunishedDate(user)}
  </div>
</div>
<div class="collapse-content">
  <PunishmentInfo
    p_types="{p_types}"
    punishments="{user.punishments}"
    sum="{totalSum}"
  />
</div>

<style>
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
