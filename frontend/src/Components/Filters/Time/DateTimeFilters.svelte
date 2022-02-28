<script lang="ts">
  import Select from "svelte-select";
  import { onlyShowAfterDate, users } from "../../../stores/users";

  const items = ["alle tider", "i dag", "siste uke", "siste måned"];

  let value: string = "alle tider";

  let dateToFilterBy: Date = new Date(1560807962);

  $: onlyShowAfterDate.set(dateToFilterBy);

  function handleSelect(event) {
    if (event.detail.value == "alle tider") {
      var today = new Date();
      dateToFilterBy = new Date(
        today.getFullYear() - 5,
        today.getMonth(),
        today.getDate()
      );
    } else if (event.detail.value == "i dag") {
      dateToFilterBy = new Date();
    } else if (event.detail.value == "siste uke") {
      var today = new Date();
      dateToFilterBy = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 7
      );
    } else {
      var today = new Date();
      dateToFilterBy = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        today.getDate()
      );
    }
  }
</script>

<h2>Vis straffer fra:</h2>
<Select items="{items}" value="{value}" on:select="{handleSelect}" />

<style>
  .themed {
    --border: 3px solid blue;
    --borderRadius: 10px;
    --placeholderColor: blue;
  }
</style>
