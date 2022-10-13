<script lang="ts">
  import UserFilters from "./checkboxes/UserFilters.svelte";
  import PunishmentsFilters from "./punishments/PunishmentsFilters.svelte";
  import SearchUser from "./SearchUser.svelte";
  import DateTimeFilters from "./time/DateTimeFilters.svelte";
</script>

<div class="wrapper">
  <SearchUser />
  <hr />
  <PunishmentsFilters />
  <hr />
  <DateTimeFilters />
  <hr />
  <UserFilters />
</div>

<style lang="less">
  @import "../../variables.less";

  .wrapper {
    width: 25rem;
    padding: 20px;
    display: flex;
    flex-direction: column;
    background: #093b51;
    border: 1px solid #072e3f;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    height: fit-content;
    padding-bottom: 5rem;
  }

  hr {
    margin: 40px 0 30px 0;
    border-top: 1px solid #06212d;
    backdrop-filter: blur(4px);
    /* Note: backdrop-filter has minimal browser support */

    border-radius: 10px;
  }
</style>
