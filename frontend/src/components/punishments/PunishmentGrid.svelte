<script lang="ts">
  import type { Group } from "../../lib/types";
  import { localStorageUsersEmpty } from "../../lib/functions";
  import { users } from "../../stores/users";
  import { group } from "../../stores/group";
  import { punishmentsToFilter } from "../../stores/punishmentToFilter";
  import GridContent from "./GridContent.svelte";
  import { getGroup } from "../../lib/api";
  import Loader from "../Loader.svelte";

  const setStores = (firstGroup: Group): void => {
    users.set(firstGroup.members);
    punishmentsToFilter.set(firstGroup.punishment_types);
  };
</script>

<div class="punishment_grid">
  {#if localStorageUsersEmpty()}
    {#await getGroup($group.group_id)}
      <Loader />
    {:then firstGroup}
      {#await setStores(firstGroup)}
        <Loader />
      {:then}
        <GridContent />
      {/await}
    {/await}
  {:else}
    <GridContent />
  {/if}
</div>

<style lang="postcss">
  .punishment_grid {
    @apply mt-4;
  }
</style>
