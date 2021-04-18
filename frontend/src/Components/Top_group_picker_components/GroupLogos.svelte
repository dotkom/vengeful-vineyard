<script lang="ts">
  import GroupStore from "../../stores/groups";
  import GroupButton from "./GroupButton.svelte";
  //import { getGroups } from "../../api";
</script>

<div class="groupLogosContainer">
  {#each $GroupStore.groups as { name, logoUrl }}
    <GroupButton name="{name}" logoUrl="{logoUrl}" />
  {/each}
</div>

<style lang="less">
  @import "../../variables.less";
  .groupLogosContainer {
    margin: 0 auto;
  }
</style>
