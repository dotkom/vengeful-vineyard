<script lang="ts">
  import { getGroup, getUser } from "../../api";
  import PunishmentInfo from "./PunishmentInfo.svelte";

  let wine = "assets/wineglass.svg";

  let group_id: number = 1;
</script>

<div class="punishment_grid">
  {#await getGroup(group_id) then group}
    {#each group.members as user}
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
  {/await}
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
