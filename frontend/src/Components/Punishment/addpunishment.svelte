<script lang="ts">
  export let punishmentTypes: string[] = [];

  let type: string = "";
  let reason: string = "";

  const addpunish = () => {
    alert("Added " + type + "straff because " + reason);
  };
</script>

<form on:submit|preventDefault="{addpunish}">
  {#each punishmentTypes as punishmentType}
    <label>
      <input type="radio" bind:group="{type}" value="{punishmentType}" />
      {punishmentType}
    </label>
  {/each}
  <input type="text" bind:value="{reason}" placeholder="Reason..." />
  <button>Add punishment</button>
</form>

<style lang="less">
</style>
