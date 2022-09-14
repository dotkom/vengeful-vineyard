<script lang="ts">
  import Navbar from "./components/navbar/Navbar.svelte";
  import GroupLogos from "./components/groups/GroupLogos.svelte";
  import Footer from "./components/footer/Footer.svelte"
  import PunishmentGrid from "./components/punishments/PunishmentGrid.svelte";
  import Sidebar from "./components/filters/Sidebar.svelte";
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

<div class="content">
  <Navbar />
  <div class="body_content">
    <Sidebar />
    <div class="punishments">
      <GroupLogos />
      <PunishmentGrid />
    </div>
  </div>
  <Footer />
</div>

<style lang="less" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  @import "variables.less";
  .body_content {
    @apply flex;
    margin: 0 5em;
  }

  .content {
    background-color: #f7f7f7;
    font-family: "Source Sans Pro", sans-serif;
  }

  h1 {
    @apply uppercase text-center;
    font-family: "Montserrat", sans-serif;
    margin: 20px;
  }
  .punishments {
    @apply w-7/12 mt-4;
    margin-left: auto;
    margin-right: auto;
  }
</style>
