<script lang="ts">
  import GroupPickerContainer from "./Components/Top_group_picker_components/GroupPickerContainer.svelte";
  import SortNav from "./Components/Left_navbar_components/SortNav.svelte";
  import PunishmentContainer from "./Components/PunishmentDisplay/PunishmentContainer.svelte";
  import Footer from "./Components/Footer/Footer.svelte";
</script>

<div class="content">
  <GroupPickerContainer />
  <div class="body_content">
    <SortNav />
    <PunishmentContainer />
  </div>
  <Footer />
</div>

<style lang="less">
  @import "variables.less";
  .body_content {
    display: flex;
    margin: 0 5em;
  }

  .content {
    background-color: #f2f2f2;
  }
</style>
