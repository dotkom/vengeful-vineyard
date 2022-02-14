<script lang="ts">
  import type { PunishmentType } from "src/types";
  import { group } from "../../../stores/groups";
  import PunishmentTag from "./PunishmentTag.svelte";
  import { punishmentsToFilter } from "../../../stores/punishmentToFilter";
  import { users } from "../../../stores/users";

  const resetPunishmentFilters = () => {
    punishmentsToFilter.set(group.punishmentTypes);
    users.set(group.members);
  };

  $: showAll =
    $punishmentsToFilter
      .map((pun) => pun.id)
      .sort()
      .join(",") ===
    group.punishmentTypes
      .map((pun) => pun.id)
      .sort()
      .join(",");
</script>

<div class="wrapper">
  <div class="punishmentTags">
    {#each $punishmentsToFilter as punishment}
      <PunishmentTag punishment="{punishment}" />
    {/each}
  </div>

  <div class="form-control">
    <label class="cursor-pointer label">
      <input
        type="checkbox"
        bind:checked="{showAll}"
        class="checkbox checkbox-secondary"
        disabled="{showAll}"
        on:click="{() => resetPunishmentFilters()}"
      />
      <span class="label-text">Vis alle</span>
    </label>
  </div>
</div>

<style lang="less">
  .wrapper {
  }

  .punishmentTags {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap-reverse;
  }

  .label-text {
    color: #eeeeee;
    font-size: 20px;
    float: left;
    padding-left: 5px;
  }

  .label {
    display: flex;
    justify-content: left;
    width: fit-content;
  }
</style>
