<script lang="ts">
  import GroupPickerContainer from "./Components/Top_group_picker_components/GroupPickerContainer.svelte";
  import SortNav from "./Components/Left_navbar_components/SortNav.svelte";
  import PunishmentContainer from "./Components/PunishmentDisplay/PunishmentContainer.svelte";
  import SideBar from "./Components/Left_navbar_components/SideBar.svelte";
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
  <GroupPickerContainer />
  <div class="body_content">
    <SideBar />
    <div class="punishments">
      <h1 class="title">Straffer</h1>
      <PunishmentContainer />
    </div>
  </div>
</div>

<style lang="less">
  @import "variables.less";
  .body_content {
    display: flex;
    margin: 0 10% 0;
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
</style>
