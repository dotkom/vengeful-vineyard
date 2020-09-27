<script lang="ts">
  import VvLogo from "./VvLogo.svelte";
  import GroupLogos from "./GroupLogos.svelte";
</script>

<div class="group_picker_container">
  <VvLogo />
  <GroupLogos />
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
