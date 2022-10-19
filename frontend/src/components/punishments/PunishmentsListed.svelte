<script lang="ts">
  import { shouldDisplay } from "../../timeFilterFunc";
  import type { PunishmentType } from "src/types";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";
  import { onlyShowAfterDate, onlyShowBeforeDate } from "../../stores/users";

  export let p_types: PunishmentType[];

  export let row;

  const getUrl = (p_type: number) => {
    return p_types.filter((p) => p.punishment_type_id === p_type)[0].logo_url;
  };
</script>

<div class="flex justify-center flex-wrap max-w-[13rem]">
  {#await row.straffer then}
    {#if row.straffer}
      {#each row.straffer
        .filter((pun) => $punishmentsToFilter
            .map((pun) => pun.punishment_type_id)
            .includes(pun.punishment_type))
        .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
        .filter( (pun) => shouldDisplay(new Date(pun.created_time), $onlyShowAfterDate, $onlyShowBeforeDate) ) as punishment}
        {#each Array(punishment.amount) as _, i}
          <img
            class="h-8 w-8 m-[2px]"
            alt="punishment"
            src="{getUrl(punishment.punishment_type)}"
          />
        {/each}
      {/each}
    {:else}
      Ingen straffer
    {/if}
  {/await}
</div>
