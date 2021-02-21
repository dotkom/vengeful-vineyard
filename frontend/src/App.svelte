<script lang="ts">
  import GroupPickerContainer from "./Components/Top_group_picker_components/GroupPickerContainer.svelte";
  import SortNav from "./Components/Left_navbar_components/SortNav.svelte";
  import PunishmentContainer from "./Components/PunishmentDisplay/PunishmentContainer.svelte";
</script>

<link rel="preconnect" href="https://fonts.gstatic.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;400&display=swap"
  rel="stylesheet"
/>

<div class="content">
  <GroupPickerContainer />
  <div class="body_content">
    <SortNav />
    <div class="punishments">
      <h1 class="title">SOMETHINGKOM</h1>
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
  }

  h1 {
    text-align: center;
    font-family: "Montserrat", sans-serif;
    margin: 20px;
    text-transform: uppercase;
  }
</style>
