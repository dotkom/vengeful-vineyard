<script lang="ts">
  // import GroupStore from "../../stores/groups";
  import GroupButton from "./GroupButton.svelte";
  import AddCustomGroup from "./AddCustomGroup.svelte";
  // import { getUserGroups } from "../../api";
  // import { onMount } from "svelte";
  // import type { Group } from "src/types";

  import { accessToken, isAuthenticated } from "@dopry/svelte-oidc";
  import { getOnlineProfile, getMyOnlineGroups } from "../../api";

  // let groups: Group[];
  // let user_id = 1; //default ig

  // onMount(async () => {
  //   getUserGroups(user_id).then((res) => (groups = res.data));
  // });
</script>

<div class="groupLogosContainer">
  {#if $isAuthenticated}
    {#await getOnlineProfile($accessToken) then value}
      {#await getMyOnlineGroups($accessToken, value.id) then groups}
        {#each groups.filter((singGroup) => !singGroup.name_short.includes("permissions")) as group}
          <GroupButton name="{group.name_short}" logoUrl="{group.image}" />
        {/each}
      {/await}
    {/await}
  {/if}

  <AddCustomGroup />
</div>

<style lang="less">
  @import "../../variables.less";
  .groupLogosContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }
</style>
