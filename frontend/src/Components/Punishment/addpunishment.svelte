<script lang="ts">
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";
  export let punishmentTypes: string[] = [];
  export let name: string;

  interface Punishment {
    name: string;
    number: number;
  }

  let punishments: Punishment[] = [];
  let reason: string = "";
  let showAdd: boolean = false;
  let selected: string;
  let numberOfPunishments = 1;

  const togglePunishmentModal = () => {
    showAdd = true;
  };

  const addPunishment = () => {
    punishments = [
      ...punishments,
      { name: selected, number: numberOfPunishments },
    ];
    numberOfPunishments = 1;
  };

  const removePunishment = (index: number) => {
    punishments.splice(index, 1);
    punishments = punishments;
  };

  async function createPunishments() {
    const punishment = { punishments: punishments, reason: reason, name: name };
    const json = postPunishment(punishments);

    reason = "";
    showAdd = false;
    punishments = [];
  }
</script>

<Button on:click="{togglePunishmentModal}" color="success">
  Add punishment
</Button>
<Modal bind:active="{showAdd}">
  <h1>{name}</h1>
  {#each punishments as punishment, index}
    <span>{punishment.name} - {punishment.number}</span>
    <Button color="danger" on:click="{() => removePunishment(index)}">X</Button>
    <br />
  {/each}
  <form on:submit|preventDefault="{togglePunishmentModal}">
    <select bind:value="{selected}">
      {#each punishmentTypes as punishmentType}
        <option value="{punishmentType}">{punishmentType}</option>
      {/each}
    </select>
    <span>{numberOfPunishments}</span>
    <Button
      on:click="{() => {
        numberOfPunishments += 1;
      }}"
    >
      +
    </Button>
    <Button
      on:click="{() => {
        if (numberOfPunishments === 1) {
          return;
        }
        numberOfPunishments -= 1;
      }}"
    >
      -
    </Button>
    <Button on:click="{addPunishment}">Legg til</Button>
    <br />
    <br />
    <input type="text" bind:value="{reason}" placeholder="Begrunnelse" />
    <Button on:click="{createPunishments}">Send straffer</Button>
  </form>
</Modal>

<style lang="less">
</style>
