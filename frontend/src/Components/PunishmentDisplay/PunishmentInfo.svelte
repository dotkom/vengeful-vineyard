<script lang="ts">
  import { deletePunishment, getGroupUser } from "../../api";
  import type { Punishment, PunishmentType, User } from "../../types";
  import { users } from "../../stores/users";
  import { group } from "../../stores/groups";

  export let user: User;
  export let punishments: Punishment[];
  export let p_types: PunishmentType[];
  export let totalSum: number;

  let cancelIcon = "assets/red-x.svg";

  const getUrl = (p_type: number) => {
    return p_types.filter((p) => p.punishment_type_id == p_type)[0].logo_url;
  };

  const returnDate = (given_time: String) => {
    return given_time.split("T")[0];
  };

  /**
   * Deletes a punishment from database and removes the item from GUI.
   * Updates total sum displayed
   * @param id punishment's id
   */
  const removePunishment = async (id: number) => {
    await deletePunishment(id).then(async () => {
      users.set(
        await Promise.all(
          $group.members.map(async (member) =>
            getGroupUser($group.group_id, member.user_id)
          )
        )
      );
    });

    punishments = user.punishments.filter((p) => p.punishment_id !== id);
  };
</script>

<div class="punishment_info">
  <!-- <slot name="punishments" /> -->
  {#each punishments as punishment}
    <div class="punishment">
      <div class="reason_wrapper">
        <div
          class="deleteBtn"
          on:click="{() => {
            removePunishment(punishment.punishment_id);
          }}"
        >
          <img class="h-7 w-7" src="{cancelIcon}" alt="Remove punishment" />
        </div>
      </div>

      <div
        class="col-span-2 "
        style="border-right: 1px solid #d9d9d9; border-left: 1px solid #d9d9d9;"
      >
        <p
          class="break-words"
          style="max-width: 100%;
        white-space: break-spaces;"
        >
          {punishment.reason}
        </p>
      </div>

      <!-- Add a drink icon for each punishment-->
      <div class="punishment_icons">
        {#each Array(punishment.amount) as _, i}
          <img
            class="icon"
            src="{getUrl(punishment.punishment_type)}"
            alt="punishment"
          />
        {/each}
      </div>
      <div class="col-span-3">{returnDate(punishment.created_time)}</div>
    </div>
  {:else}
    <div></div>
  {/each}
  <div class="sum">Total sum: {totalSum}</div>
</div>

<style lang="less">
  .punishment_info {
    // @apply px-12;
  }
  .punishment {
    @apply grid grid-cols-9 gap-1 bg-white shadow-md h-20;
    border: 0.3px solid #d9d9d9;
    box-sizing: border-box;
    box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    height: auto;
  }

  .punishment p {
    @apply p-4 text-sm font-sspro !important;
  }

  .punishment > {
    @apply items-center m-1 p-1;
  }

  .icon {
    @apply h-8 w-8;
  }

  .sum {
    @apply m-4 text-right;
  }

  .deleteBtn {
    @apply float-left self-center hover:cursor-pointer;
    min-width: 1.5rem;
  }

  .punishment_icons {
    @apply flex justify-center col-span-3;
    min-width: 7em;
    border-right: 1px solid #d9d9d9;
  }

  // .reason {
  //   max-width: 7em;
  //   border-left: 1px solid #d9d9d9;
  // }

  .reason_wrapper {
    @apply flex m-0 col-start-1 col-end-2;
    max-width: 10rem;
    justify-content: center;
  }
</style>
