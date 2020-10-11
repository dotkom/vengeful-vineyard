<script lang="ts">
  export let type : string = "";
</script>

{#if type == "Vin"}
  <img alt="Vinstraff" src="assets/wine.svg" />
{:else if type == "Øl"}
  <img alt="Ølstraff" src="assets/beer.svg" />
{:else if type == "Sprit"}
  <img alt="Dworekstraff" src="assets/vodka.svg" />
{:else}
  throw new Error;
{/if}

<style lang="less">
  img {
    height: 5em;
  }
</style>
