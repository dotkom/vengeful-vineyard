<script lang="ts">
  import { shouldDisplay } from "../../timeFilterFunc";
  import type { PunishmentType, User } from "../../lib/types";
  import { getLogoUrl } from "../../lib/functions";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";
  import { onlyShowAfterDate, onlyShowBeforeDate } from "../../stores/users";
  import { Circle } from "svelte-loading-spinners";

  export let punishmentTypes: PunishmentType[];
  export let row: Row;

  interface Row {
    user: User;
    straffer: any;
  }
</script>

<div class="flex justify-center flex-wrap max-w-[13rem]">
  {#await row.straffer}
    <Circle size="60" color="#153E75" unit="px" duration="1s" />
  {:then}
    {#if row.straffer}
      {#each row.straffer
        .filter((pun) =>
          $punishmentsToFilter
            .map((pun) => pun.punishment_type_id)
            .includes(pun.punishment_type)
        )
        .filter((pun) => ($showPaid ? pun : pun.verified_time === null))
        .filter((pun) =>
          shouldDisplay(
            new Date(pun.created_time),
            $onlyShowAfterDate,
            $onlyShowBeforeDate
          )
        ) as punishment}
        {#each Array(punishment.amount) as _, i}
          <img
            class="h-8 w-8 m-[2px]"
            alt="punishment"
            src="{getLogoUrl(punishment.punishment_type, punishmentTypes)}"
          />
        {/each}
      {/each}
    {:else}Ingen straffer{/if}
  {/await}
</div>
