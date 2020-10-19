<script lang="ts">
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";
  export let punishmentTypes: string[] = [];
  export let name: string;

  let type: string = "";
  let reason: string = "";
  let showAdd: boolean = false;

  const addpunish = () => {
    showAdd = true;
  };

  const postPunishment = () => {
    type = "";
    reason = "";
    showAdd = false;
    alert("Whipped!");
  };
</script>

<Button on:click="{addpunish}" color="success">Add punishment</Button>
<Modal bind:active="{showAdd}">
  <h1>{name}</h1>
  <form on:submit|preventDefault="{addpunish}">
    {#each punishmentTypes as punishmentType}
      <label>
        <input type="radio" bind:group="{type}" value="{punishmentType}" />
        {punishmentType}
      </label>
    {/each}
    <input type="text" bind:value="{reason}" placeholder="Reason..." />
    <Button on:click="{postPunishment}">Whip!</Button>
  </form>
</Modal>

<style lang="less">
</style>
