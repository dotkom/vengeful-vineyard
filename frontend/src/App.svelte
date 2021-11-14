<script lang="ts">
  import Navbar from "./Components/Top_group_picker_components/Navbar.svelte";
  import SideBar from "./Components/Left_navbar_components/SideBar.svelte";
  import GroupLogos from "./Components/Top_group_picker_components/GroupLogos.svelte";
  import Footer from "./Components/Footer/Footer.svelte";
  import PunishmentGrid2 from "./Components/PunishmentDisplay/PunishmentGrid2.svelte";
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
    <SideBar />
    <div class="punishments">
      <GroupLogos />
      <PunishmentGrid2 />
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
    display: flex;
    margin: 0 5em;
  }

  .content {
    background-color: #f2f2f2;
    font-family: "Source Sans Pro", sans-serif;
  }

  h1 {
    text-align: center;
    font-family: "Montserrat", sans-serif;
    margin: 20px;
    text-transform: uppercase;
  }
  .punishments {
    @apply w-7/12;
    margin-left: auto;
    margin-right: auto;
  }
</style>
