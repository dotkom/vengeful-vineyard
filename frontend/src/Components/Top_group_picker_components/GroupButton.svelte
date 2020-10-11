<script lang="ts">
  export let logoUrl = "";
  export let name = "";
  import GroupStore from "../../stores/groups";

  const changeActive = () => {
    $GroupStore.currentGroup = name;
  };
</script>

<input
  type="image"
  class="groupBtn"
  class:active="{$GroupStore.currentGroup === name}"
  src="{logoUrl}"
  on:click="{changeActive}"
  alt="{name}"
/>

<style lang="less">
  @import "../../variables.less";
  .groupBtn {
    height: 80px;
    border-radius: 100%;
    background-color: @white;
    margin: 5px;
    box-shadow: 0 8px #c9c9c9;
    transition: background-color 0.6s ease;
  }

  .groupBtn:hover {
    background-color: @secondary;
  }

  .active {
    background-color: @secondary;
  }
</style>
