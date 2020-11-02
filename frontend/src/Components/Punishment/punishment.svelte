<script lang="ts">
  import Button from "../Button.svelte";

  export let id: number;
  export let imageurl: string;
  export let price: number;
  export let reason: string;
  export let verifiedBy: string | null;
  export let verifiedTime: string | null;
  export let givenBy: string;
  export let givenTime: string;

  let showPunishment: boolean = true;

  const ISO8601toString = (time: string) => {
    return time.replace("T", " ");
  };

  const validatePunishment = async () => {
    // Post request
    verifiedBy = "MyUsername";
    verifiedTime = "2020-10-25T17:12:04";

    const res = await fetch(
      "http://localhost:8080/validatePunishment/" + id.toString(),
      {
        method: "POST",
      }
    );
  };

  const deletePunishment = async () => {
    showPunishment = false;

    const res = await fetch(
      "http://localhost:8080/validatePunishment/" + id.toString(),
      {
        method: "DELETE",
      }
    );
  };
</script>

{#if showPunishment}
  <img alt="Straff" src="{imageurl}" />
  <p>Begrunnelse: {reason}</p>
  <p>Beløp: {price}</p>
  <p>Gitt av {givenBy} ({ISO8601toString(givenTime)})</p>
  {#if verifiedBy !== null && verifiedTime !== null}
    <p>Verifisert utbetalt: {verifiedBy} ({ISO8601toString(verifiedTime)})</p>
  {:else}
    <Button on:click="{validatePunishment}" color="success">
      Marker som betalt
    </Button>
    <Button on:click="{deletePunishment}" color="danger">Slett</Button>
  {/if}
  <br />
  <br />
{/if}

<style lang="less">
  img {
    height: 5em;
  }
</style>
