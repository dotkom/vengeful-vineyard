<script lang="ts">
  import type { Group, User } from "src/types";
  import { getGroup, getUser } from "../../api";
  import { users } from "../../stores/users";
  import { group } from "../../stores/groups";
  import PunishmentInfo from "./PunishmentInfo.svelte";
  let wine = "assets/wineglass.svg";
  let group_id: number = 1;
  // let fetchedGroup: Group;
  getGroup(group_id).then((res) => {
    //group.set(res);
    window.localStorage.setItem("group", JSON.stringify(res));
    window.localStorage.setItem("users", JSON.stringify(res.members));
    window.localStorage.setItem(
      "punishmentFilters",
      JSON.stringify(res.punishment_types)
    );
    console.log(window.localStorage.getItem("users"));

    console.log(window.localStorage.getItem("users"));

    console.log(window.localStorage.getItem("punishmentFilters"));
  });
</script>

<div class="punishment_grid">
  <!-- {#await getGroup(group_id) then group}
    {#each group.members as user} -->
  {#each $users as user}
    <div
      tabindex="0"
      class="collapse w-full border rounded-box border-base-300"
    >
      {#await getUser(user.user_id) then userInfo}
        <div class="accordion_text collapse-title text-xl font-medium">
          <div class="name">{user.first_name} {user.last_name}</div>
          <div class="icons">
            <!-- <img class="icon" alt="wine" src="{wine}" />
              <img class="icon" alt="wine" src="{wine}" /> -->
            {#each userInfo.punishments as punishment}
              <p>{punishment.punishment_type}</p>
              <img class="icon" alt="wine" src="{wine}" />
            {:else}
              Ingen straffer
            {/each}
          </div>
          <div>
            <!-- {userInfo.punishments[userInfo.punishments.length - 1]}.givenTime -->
            date
          </div>
        </div>
        <div class="collapse-content">
          <PunishmentInfo punishments="{userInfo.punishments}" />
        </div>
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
