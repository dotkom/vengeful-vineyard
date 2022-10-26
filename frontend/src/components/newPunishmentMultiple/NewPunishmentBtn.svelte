<script lang="ts">
  /* eslint-disable no-unused-vars */
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
    class="text-white bg-green-500 hover:bg-green-600 font-medium rounded-2xl text-sm  text-center
inline-flex items-center px-2 py-1"
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
