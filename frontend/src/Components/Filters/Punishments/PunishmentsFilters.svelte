<script lang="ts">
  import type { Group, PunishmentType } from "src/types";
  import { group } from "../../../stores/groups";
  import PunishmentTag from "./PunishmentTag.svelte";

  let punishments: PunishmentType[] = group.punishmentTypes;
</script>

<div class="wrapper">
  <div class="punishmentTags">
    {#each punishments as punishment}
      <PunishmentTag punishment="{punishment}" />
    {/each}
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
</style>
