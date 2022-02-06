<script lang="ts">
  import { getGroup, getUser } from "../../api";
  import PunishmentInfo from "./PunishmentInfo.svelte";
  import type { Punishment, User } from "../../types";
  import { accessToken, isAuthenticated } from "@dopry/svelte-oidc";

  export let currentGroup;

  //TODO get correct icons
  let wine = "assets/wineglass.svg";

  //TODO add actual group id
  $: group_id = 1;

  /**
   * TODO get currently picked OW group
   * @param user
   */
  const getUserGroup = (user: User) => {
    if ($isAuthenticated) {
    }
  };

  const getLastPunishedDate = (user: User) => {
    let date: String = "";
    try {
      date =
        user.punishments[user.punishments.length - 1].created_time.split(
          "T"
        )[0];
    } catch (TypeError) {
      return "No date";
    }
    return date;
  };

  const getPunishmentAmount = (user: User) => {
    let amount: number = null;
    let punishments: Punishment[] = user.punishments;
    for (let i = 0; i < punishments.length; i++) {
      amount += punishments[i].amount;
    }
    return amount;
  };
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
              {#each Array(getPunishmentAmount(userInfo)) as i}
                <img class="icon" alt="wine" src="{wine}" />
              {:else}
                Ingen straffer gitt
              {/each}
            </div>
            <div>
              {getLastPunishedDate(userInfo)}
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

<style lang="less">
  @import "../../variables.less";

  .collapse {
    display: inline-block;
  }

  .accordion_text {
    @apply flex flex-row justify-between text-gray-500;
  }
  .name {
    min-width: 7em;
  }

  .icon {
    @apply h-6;
  }

  .icons {
    @apply flex justify-center;
  }

  .punishment_grid {
    @apply mt-4;
  }
</style>
