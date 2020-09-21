<script lang="ts">
import SortAccordions from "./SortAccordions.svelte";
import ChoosePunishments from "./ChoosePunishments.svelte";
</script>

<div class="sortNav">
  <div class="committeeName">
    <h2 class="groupTitle">Noe</h2>
    <hr />
  </div>

  <SortAccordions />
  <ChoosePunishments />
</div>

<style>
.sortNav {
  display: flex;
  flex-direction: column;
  width: 20%;
  justify-content: center;
  background-color: #194890;
}

.committeeName {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 70px;
  background-color: #153c79;
  color: white;
  font-weight: bold;
  margin-bottom: 10px;
  -webkit-box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 4px 8pxac -1px rgba(0, 0, 0, 0.75);
  align-items: center;
  width: 100%;
  padding: 10px;
}

h2 {
  font-size: 25px;
  margin-bottom: 5px;
}

hr {
  width: 95%;
  margin: 0 auto;
  border: 0.3px solid orange;
}
</style>
