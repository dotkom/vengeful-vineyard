<script lang="ts">
  import { deletePunishment, getGroupUser } from "../../api";
  import type { Punishment, PunishmentType, User } from "../../types";
  import { users } from "../../stores/users";

  export let user: User;
  export let punishments: Punishment[];
  export let p_types: PunishmentType[];
  export let totalSum: number;

  let cancelIcon = "assets/red-x.svg";
  // $: totalSum = calculateSum();

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
    await deletePunishment(id);
    punishments = user.punishments.filter((p) => p.punishment_id !== id);

    // totalSum = calculateSum();
  };
</script>

<div class="punishment_info">
  <slot name="punishments" />
  {#each punishments as punishment}
    <div class="punishment">
      <div class="reason_wrapper">
        <div
          class="deleteBtn"
          on:click="{() => {
            removePunishment(punishment.punishment_id);
          }}"
        >
          <img class="icon" src="{cancelIcon}" alt="Remove punishment" />
        </div>

        <p class="reason">{punishment.reason}</p>
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
      <div>{returnDate(punishment.created_time)}</div>
    </div>
  {:else}
    <div></div>
  {/each}
  <div class="sum">Total sum: {totalSum}</div>
</div>

<style lang="less">
  .punishment_info {
    @apply px-12;
  }
  .punishment {
    @apply flex flex-row justify-between space-x-8 mx-2 bg-white p-4 px-12 mt-6;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  }

  .punishment p {
    @apply p-4 text-sm font-sspro !important;
  }

  .punishment > {
    @apply items-center m-0;
  }

  .icon {
    @apply h-6 w-6;
  }

  .sum {
    @apply m-4 text-right;
  }

  .deleteBtn {
    @apply float-left self-center hover:cursor-pointer;
    min-width: 1.5rem;
  }

  .punishment_icons {
    @apply flex m-0;
    min-width: 7em;
  }

  .reason {
    max-width: 7em;
  }

  .reason_wrapper {
    @apply flex m-0 !important;
    max-width: 10rem;
  }
</style>
