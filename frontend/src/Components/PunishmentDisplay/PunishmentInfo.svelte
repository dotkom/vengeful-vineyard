<script lang="ts">
  import {
    deletePunishment,
    getGroupUser,
    postValidatePunishment,
  } from "../../api";
  import type { Punishment, PunishmentType, User } from "../../types";
  import { users } from "../../stores/users";
  import { group } from "../../stores/groups";
  import SvelteTooltip from "svelte-tooltip";
  import AddNewPunishment from "./AddNewPunishment.svelte";

  export let user: User;
  export let punishments: Punishment[];
  export let p_types: PunishmentType[];
  export let totalSum: number;

  let cancelIcon = "assets/cancelIcon.svg";
  let verifyIcon = "assets/checkGreen.svg";

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

  const verifyPunishment = async (id: number) => {
    await postValidatePunishment(id).then(async () => {
      users.set(
        await Promise.all(
          $group.members.map(async (member) =>
            getGroupUser($group.group_id, member.user_id)
          )
        )
      );
    });

    //punishments = user.punishments.filter((p) => p.punishment_id !== id);
  };
</script>

<div class="punishment_info">
  <AddNewPunishment user="{user}" />
  <!-- <slot name="punishments" /> -->
  {#each punishments as punishment}
    <div class="punishment">
      <div class="reason_wrapper">
        <!-- <SvelteTooltip
          tip="Annuler straff"
          bottom
          color="rgba(237, 63, 63, 0.74)"
          class="z-10"
        >
          <button
            on:click="{() => {
              removePunishment(punishment.punishment_id);
            }}"
            type="button"
            style="width: fit-content;"
            class="text-white bg-[rgb(255,25,25)] hover:bg-[##ff4747]/80 focus:ring-4 focus:ring-[##ff4747]/50 font-medium rounded-lg text-sm px-1.5 py-1 text-center inline-flex items-center mr-2 mb-2"
          >
            <img class="w-3 h-3" src="{cancelIcon}" alt="punishment" />
            Annuler
          </button>
        </SvelteTooltip> -->
        <SvelteTooltip
          tip="Marker som betalt"
          bottom
          color="rgba(117, 191, 148, 0.6)"
        >
          <div
            class="verifyBtn"
            on:click="{() => verifyPunishment(punishment.punishment_id)}"
          >
            <img class="h-7 w-7" src="{verifyIcon}" alt="Remove punishment" />
          </div></SvelteTooltip
        >
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
          "{punishment.reason}"
        </p>
        <p
          class="break-words"
          style="max-width: 100%;
      white-space: break-spaces; padding: 0!important;"
        >
          - Gitt av <i>user</i>
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
      <div class="col-span-2">
        {returnDate(punishment.created_time)}
      </div>
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
    padding: 0;
  }

  .verifyBtn {
    @apply float-left self-center hover:cursor-pointer;
    min-width: 1.5rem;
  }

  .punishment_icons {
    @apply flex justify-center items-center col-span-4;
    min-width: 7em;
    border-right: 1px solid #d9d9d9;
    height: 100%;
  }

  .reason_wrapper {
    @apply flex m-0 col-start-1 col-end-2;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
