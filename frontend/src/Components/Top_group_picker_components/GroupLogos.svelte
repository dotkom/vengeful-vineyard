<script lang="ts">
  import GroupStore from "../../stores/groups";
  import AddCustomGroup from "./AddCustomGroup.svelte";
  import GroupButton from "./GroupButton.svelte";
</script>

<div class="groupLogosContainer">
  {#each $GroupStore.groups as { name, logoUrl }}
    <GroupButton name="{name}" logoUrl="{logoUrl}" />
  {/each}
  <AddCustomGroup />
</div>

<style lang="less">
  @import "../../variables.less";
  .groupLogosContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }
</style>
