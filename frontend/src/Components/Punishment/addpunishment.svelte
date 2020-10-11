<script lang="ts">
  let type : string = "";
  let reason : string = "";
  let price : number = 0;

  const addpunish = () => {
    alert("Added " + type + "straff with price " + price + " because " + reason);
  }
</script>

<form on:submit|preventDefault={addpunish}>
  <label>
    <input type="radio" bind:group={type} value="Øl">
    Øl
  </label>

  <label>
    <input type="radio" bind:group={type} value="Vin">
    Vin
  </label>

  <label>
    <input type="radio" bind:group={type} value="Sprit">
    Sprit
  </label>
  <input type="text" bind:value={reason} placeholder="Reason..."/>
  <input type="number" bind:value={price} placeholder="Price..."/>
  <button>Add punishment</button>
</form>

<style lang="less">
</style>
