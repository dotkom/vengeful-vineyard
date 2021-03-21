<script lang="ts">
  import VvLogo from "./VvLogo.svelte";
  import GroupLogos from "./GroupLogos.svelte";
  import GroupStore from "../../stores/groups";
  import { onMount } from "svelte";
  import AddGroup from "./AddGroup.svelte";
  import { getGroups } from "../../api.ts";

  onMount(async () => {
    const groups = await getGroups()
    $GroupStore = { currentGroup: groups[0].name, groups: groups };
  });
</script>

<div class="group_picker_container">
  <VvLogo />
  <GroupLogos />
  <AddGroup />
</div>

<style lang="less">
  @import "../../variables.less";
  .group_picker_container {
    display: flex;
    flex-direction: row;
    flex-flow: row nowrap;
    align-content: center;
    height: 100%;
    background-color: @primary;
    margin-bottom: 30px;
    padding: 10px;
  }
</style>
