<script lang="ts">
  import { onMount } from "svelte";
  import GroupStore from "../../stores/groups";
  import { getGroup, getUser, deletePunishment } from "../../api";
  import type { Group, User } from "src/types";

  let wine = "assets/wineglass.svg";
  let cancelIcon = "assets/x-icon.svg";

  let group_id: number = 1;
</script>

{#await getGroup(group_id) then group}
  {#each group.members as user}
    <div
      tabindex="0"
      class="collapse w-full border rounded-box border-base-300"
    >
      {#await getUser(user.user_id) then userInfo}
        <div class="accordion_text collapse-title text-xl font-medium">
          <div>{user.first_name} {user.last_name}</div>
          {#if userInfo.punishments.length == 0}
            <div>Ingen straffer</div>
          {:else}
            {#each userInfo.punishments as punishment}
              <img class="icon" alt="wine" src="{wine}" />
            {/each}
            <div>
              <!-- {userInfo.punishments[userInfo.punishments.length - 1]}.givenTime -->
              date
            </div>
          {/if}
        </div>
        <div class="collapse-content">
          {#if userInfo.punishments.length == 0}
            <p>Ingen straffer å vise</p>
          {:else}
            {#each userInfo.punishments as punishment}
              <div class="punishment">
                <button
                  type="button"
                  on:click="{() => deletePunishment(punishment.id)}"
                >
                  <img
                    class="cancel"
                    src="{cancelIcon}"
                    alt="remove punishment"
                  />
                </button>
                <div>{punishment.reason}</div>
                <div>number of punishments</div>
                <div>{punishment.created_time}</div>
              </div>
            {/each}
            <div>Total sum:</div>
          {/if}
        </div>
      {/await}
    </div>
  {/each}
{/await}

<!-- {console.log(members)} -->
<style lang="less">
  @import "../../variables.less";

  .accordion_text {
    @apply flex flex-row justify-between;
  }

  .icon {
    @apply max-h-8;
  }

  .punishment {
    @apply flex flex-row justify-between mx-2;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }

  .punishment > {
    @apply p-4;
  }
</style>
