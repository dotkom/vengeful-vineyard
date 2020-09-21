<script lang="ts">
import GroupPickerContainer from "./Components/Top_group_picker_components/GroupPickerContainer.svelte";
import SortNav from "./Components/Left_navbar_components/SortNav.svelte";
import PunishmentContainer from "./Components/PunishmentDisplay/PunishmentContainer.svelte";
</script>

<div class="content">
  <GroupPickerContainer />
  <div class="body_content">
    <SortNav />
    <PunishmentContainer />
  </div>
</div>

<style>
.body_content {
  display: flex;
  margin: 0 auto;
}

.content {
  background-color: #f2f2f2;
}
</style>
