<script lang="ts">
  // import GroupStore from "../../stores/groups";
  import GroupButton from "./GroupButton.svelte";
  // import AddCustomGroup from "./AddCustomGroup.svelte";
  // import { onMount } from "svelte";

  import { accessToken, isAuthenticated } from "@dopry/svelte-oidc";
  import { getMyOnlineGroups } from "../../lib/api";

  // let groups: Group[];
  // let userId = 1; //default ig

  // onMount(async () => {
  //   getUserGroups(userId).then((res) => (groups = res.data));
  // });
</script>

<div class="groupLogosContainer">
  {#if $isAuthenticated}
    {#await getMyOnlineGroups($accessToken) then groups}
      {#each groups.filter((owGroup) => !owGroup.name_short.includes("permissions")) as group}
        <div class="flex flex-col justify-center items-center"> 
          <GroupButton name="{group.name_short}" logoUrl="{group.image.sm}" />
          <p>{group.name_short}</p>
        </div>
      {/each}
    {/await}
  {/if}

  <!-- TODO -->
  <!-- <AddCustomGroup /> -->
</div>

<style lang="postcss">
  .groupLogosContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }
</style>
