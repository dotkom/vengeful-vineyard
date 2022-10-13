<script lang="ts">
  import UserFilters from "./checkboxes/UserFilters.svelte";
  import GroupPicker from "./GroupPicker.svelte";
  import PunishmentsFilters from "./punishments/PunishmentsFilters.svelte";
  import SearchUser from "./SearchUser.svelte";
  import DateTimeFilters from "./time/DateTimeFilters.svelte";
  import VvLogo from "./VvLogo.svelte";
</script>

<div class="wrapper">
  <VvLogo />
  <GroupPicker />
  <div class="splitter"></div>
  <SearchUser />
  <div class="splitter"></div>
  <PunishmentsFilters />
  <div class="splitter"></div>
  <DateTimeFilters />
  <div class="splitter"></div>
  <UserFilters />
</div>

<style lang="less">
  @import "../../variables.less";

  .wrapper {
    width: 25rem;
    display: flex;
    flex-direction: column;
    background: #153e75;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    height: fit-content;
    padding-bottom: 5rem;
  }

  .splitter {
    margin: 1rem 0;
  }

  hr {
    margin: 40px 0 30px 0;
    border-top: 1px solid #06212d;
    backdrop-filter: blur(4px);
    /* Note: backdrop-filter has minimal browser support */

    border-radius: 10px;
  }
</style>
