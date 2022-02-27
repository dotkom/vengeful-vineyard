<script lang="ts">
  import type { Group, User } from "src/types";
  import { getGroup, getUser, getGroupUser } from "../../api";
  import { users, filteredUsers } from "../../stores/users";
  import { group } from "../../stores/groups";
  import PunishmentInfo from "./PunishmentInfo.svelte";
  import PunishmentRow from "./PunishmentRow.svelte";
  let wine = "assets/wineglass.svg";
  let group_id: number = 2;
  // let fetchedGroup: Group;
  getGroup(group_id).then((res) => {
    //group.set(res);
    window.localStorage.setItem("group", JSON.stringify(res));
    window.localStorage.setItem("users", JSON.stringify(res.members));
    window.localStorage.setItem(
      "punishmentFilters",
      JSON.stringify(res.punishment_types)
    );
  });
</script>

<div class="punishment_grid">
  <!-- {#await getGroup(group_id) then group}
    {#each group.members as user} -->
  {#each $filteredUsers as user}
    <div
      tabindex="0"
      class="collapse w-full border rounded-box border-base-300 collapse-arrow"
    >
      {#await getGroupUser(group_id, user.user_id) then userInfo}
        <PunishmentRow user="{userInfo}" p_types="{$group.punishment_types}" />
      {/await}
    </div>
  {/each}
  <!-- {/each}
  {/await} -->
</div>

<!-- {console.log(members)} -->
<style lang="less">
  @import "../../variables.less";
  .accordion_text {
    @apply flex flex-row justify-between text-gray-500;
  }
  .name {
    min-width: 7em;
  }
  .icon {
    @apply min-h-6;
  }
  .icons {
    @apply flex justify-center;
  }
  .punishment_grid {
    @apply mt-4;
  }
</style>
