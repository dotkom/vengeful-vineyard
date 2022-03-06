<script lang="ts">
  import Navbar from "./Components/Top_group_picker_components/Navbar.svelte";
  import GroupLogos from "./Components/Top_group_picker_components/GroupLogos.svelte";
  import Footer from "./Components/Footer/Footer.svelte";
  import PunishmentGrid from "./Components/PunishmentDisplay/PunishmentGrid.svelte";
  import Sidebar from "./Components/Filters/Sidebar.svelte";
</script>

<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400&display=swap"
  rel="stylesheet"
/>
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap"
  rel="stylesheet"
/>
<Navbar />
<div class="h-screen drawer drawer-mobile w-full">
  <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content w-full">
    <!-- Page content here -->
    <!-- <label for="my-drawer-2" class="btn btn-primary drawer-button md:hidden"
      >Open drawer</label
    > -->
    <div class="punishments">
      <GroupLogos />
      <PunishmentGrid />
    </div>
    <label
      for="my-drawer-2"
      class="show-filters btn btn-primary drawer-button hidden bg-primary text-center"
      >Vis/Skjul filter</label
    >
  </div>
  <div class="drawer-side">
    <label for="my-drawer-2" class="drawer-overlay"></label>
    <ul class="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
      <!-- Sidebar content here -->
      <li><Sidebar /></li>
    </ul>
  </div>
</div>
<Footer />

<style lang="less" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  @import "variables.less";

  .body_content {
    @apply flex w-full;
  }

  h1 {
    @apply uppercase text-center;
    font-family: "Montserrat", sans-serif;
    margin: 20px;
  }
  .punishments {
    @apply mt-4;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  @media screen and (max-width: 1024px) {
    .show-filters {
      /* STICKY POSITIONING */
      display: block;
      position: fixed;
      bottom: 0;
      right: 0;
      margin-right: 5px;
      margin-bottom: 5px;

      /* STYLE */
      padding-top: 10px;
      border-radius: 30px;
      width: 7rem;
    }

    .body_content {
      width: 100%;
    }
  }
</style>
