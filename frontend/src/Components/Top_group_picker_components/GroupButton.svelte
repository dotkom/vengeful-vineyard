<script lang="ts">
  export let logoUrl;
  export let name = "";
  import GroupStore from "../../stores/groups";

  import tempImg from "/assets/image.svg";

  const changeActive = () => {
    $GroupStore.currentGroup = name;
  };
</script>

<button class="groupBtn" on:click="{changeActive}">
  {#if logoUrl}
    <img src="{logoUrl.sm}" alt="{name}" />
  {:else}
    <img src="{tempImg}" alt="{name}" />
  {/if}
</button>

<!-- <input
  type="image"
  class="groupBtn"
  class:active="{$GroupStore.currentGroup === name}"
  src="{logoUrl}"
  on:click="{changeActive}"
  alt="{name}"
/> -->
<style lang="less">
  @import "../../variables.less";
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    width: 80px;
    border-radius: 100%;
    background-color: @white;
    padding: 10px;
    vertical-align: top;
    box-shadow: 2px 1px 2px gray;
    margin: 4px 10px 4px 10px;
    border: none;
    outline: none;
  }

  button:active {
    box-shadow: 0 0 0 white;
    margin: 6px 10px 2px 10px;
    border: none;
    outline: none;
  }

  .groupBtn:hover {
    background-color: @secondary;
  }
</style>
