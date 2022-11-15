<script lang="ts">
  import type { User } from "../../lib/types";
  import { getLogoUrl, shouldDisplay } from "../../lib/functions";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import { showPaid } from "../../stores/users";
  import { onlyShowAfterDate, onlyShowBeforeDate } from "../../stores/users";
  import { Circle } from "svelte-loading-spinners";
  import {group} from "../../stores/group"

  export let row: Row;

  interface Row {
    user: User;
    straffer: any;
  }
</script>

<div class="flex justify-center flex-wrap max-w-[20rem]">
  {#await row.straffer}
    <Circle size="60" color="#153E75" unit="px" duration="1s" />
  {:then}
    {#if row.straffer}
      {#each row.straffer
       /* @ts-ignore */
        .filter((pun) =>
          $punishmentsToFilter
            .map((pun) => pun.punishment_type_id)
            .includes(pun.punishment_type_id)
        )
         /* @ts-ignore */
        .filter((pun) => ($showPaid ? pun : pun.verified_at === null))
         /* @ts-ignore */
        .filter((pun) =>
          shouldDisplay(
            new Date(pun.created_at),
            $onlyShowAfterDate,
            $onlyShowBeforeDate
          )
        ) as punishment}
        {#each Array(punishment.amount) as _, i}
          <img
            class="h-8 w-8 m-[2px]"
            alt="punishment"
            src="{getLogoUrl(punishment.punishment_type_id, $group.punishment_types)}"
          />
        {/each}
      {/each}
    {:else}Ingen straffer{/if}
  {/await}
</div>
