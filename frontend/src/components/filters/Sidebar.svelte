<script lang="ts">
  import BackToOw from "./BackToOW.svelte";
  import UserFilters from "./checkboxes/UserFilters.svelte";
  import GroupPicker from "./GroupPicker.svelte";
  import Logout from "./Logout.svelte";
  import PunishmentsFilters from "./punishments/PunishmentsFilters.svelte";
  import SearchUser from "./SearchUser.svelte";
  import DateTimeFilters from "./time/DateTimeFilters.svelte";
  import VvLogo from "./VvLogo.svelte";
</script>

<div class="sticky top-0 h-screen">
  <div class="wrapper h-full">
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
    <div class="splitter"></div>
    <BackToOw />
    <div class="splitter"></div>
    <Logout />
  </div>
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
    padding-bottom: 1rem;
  }

  .splitter {
    margin: 0.5rem 0;
  }

  hr {
    margin: 40px 0 30px 0;
    border-top: 1px solid #06212d;
    backdrop-filter: blur(4px);
    /* Note: backdrop-filter has minimal browser support */

    border-radius: 10px;
  }
</style>
