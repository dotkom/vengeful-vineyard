<script lang="ts">
  import { getGroup, getGroupUser } from "../../api";
  import type { User } from "../../types";
  import { isAuthenticated } from "@dopry/svelte-oidc";
  import PunishmentRow from "./PunishmentRow.svelte";
  // import type { User } from "src/types";

  // import { getGroup, getUser } from "../../api";
  import { users } from "../../stores/users";
  import PunishmentInfo from "./PunishmentInfo.svelte";

  //TODO add actual group id, remember to edit this number when testing
  let group_id: number = 1;

  $: group_id = 6;

  /**
   * TODO get currently picked OW group
   * @param user
   */
  const getUserGroup = (user: User) => {
    if ($isAuthenticated) {
    }
  };

  // let group_id: number = 1;

  let currentUsers: User[];

  users.subscribe((value) => {
    currentUsers = value;
  });
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
