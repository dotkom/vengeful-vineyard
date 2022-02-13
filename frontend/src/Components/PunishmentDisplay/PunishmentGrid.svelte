<script lang="ts">
  import { getGroup, getGroupUser } from "../../api";
  import type { User, PunishmentType } from "../../types";
  import { accessToken, isAuthenticated } from "@dopry/svelte-oidc";
  import PunishmentRow from "./PunishmentRow.svelte";

  // export let currentGroup;

  //TODO add actual group id
  $: group_id = 6;

  /**
   * TODO get currently picked OW group
   * @param user
   */
  const getUserGroup = (user: User) => {
    if ($isAuthenticated) {
    }
  };

  const generateCorrectIcons = (user: User, types: PunishmentType[]) => {};
</script>

<div class="punishment_grid">
  {#await getGroup(group_id) then group}
    {#each group.members as user}
      <div
        tabindex="0"
        class="collapse w-full border rounded-box border-base-300 collapse-arrow"
      >
        {#await getGroupUser(group_id, user.user_id) then userInfo}
          <PunishmentRow user="{userInfo}" p_types="{group.punishment_types}" />
        {/await}
      </div>
    {/each}
  {/await}
</div>

<style lang="less">
  @import "../../variables.less";

  .collapse {
    display: inline-block;
  }
  .punishment_grid {
    @apply mt-4;
  }
</style>
