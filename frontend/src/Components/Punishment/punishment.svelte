<script lang="ts">
  export let imageurl: string;
  export let price: number;
  export let reason: string;
  export let verifiedBy: string | null;
  export let verifiedTime: string | null;
  export let givenBy: string;
  export let givenTime: string;

  const ISO8601toString = (time: string) => {
    return time.replace("T", " ");
  };
</script>

<img alt="Straff" src="{imageurl}" />
<p>Begrunnelse: {reason}</p>
<p>Beløp: {price}</p>
<p>Gitt av {givenBy} ({ISO8601toString(givenTime)})</p>
{#if verifiedBy !== null && verifiedTime !== null}
  <p>Verifisert utbetalt: {verifiedBy} ({ISO8601toString(verifiedTime)})</p>
{/if}
<br />

<style lang="less">
  img {
    height: 5em;
  }
</style>
