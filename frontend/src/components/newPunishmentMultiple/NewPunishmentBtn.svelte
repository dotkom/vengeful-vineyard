<script lang="ts">
  import AddNewPunishment from "../punishments/AddNewPunishment.svelte";
  import PunishMultiple from "./PunishMultiple.svelte";

  let displayNewPunishment: boolean = true;

  const setDisplayNewPunishment: (display: boolean) => void = (
    display: boolean
  ) => {
    displayNewPunishment = display;
    console.log(displayNewPunishment);
  };
</script>

{#if displayNewPunishment}
  <button
    class=" btn text-white bg-green-500 hover:bg-green-600 focus:ring-4
focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center
inline-flex items-center mr-2"
    on:click="{() => setDisplayNewPunishment(!displayNewPunishment)}"
  >
    Ny straff
  </button>
{:else}
  <PunishMultiple
    displayNewPunishment="{displayNewPunishment}"
    setDisplayNewPunishment="{setDisplayNewPunishment}"
  />
{/if}
