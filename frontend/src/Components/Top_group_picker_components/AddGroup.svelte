<script lang="ts">
  import Modal from "../Modal.svelte";
  import Button from "../Button.svelte";

  let showAdd: boolean = false;

  const toggleGroupAddModal = () => {
    showAdd = true;
  };

  const addGroup = () => {
    //something
  };

  const addGroupMember = () => {
    //something
  };
</script>

<div class="addGroup-container">
  <button class="addGroup" on:click="{toggleGroupAddModal}" type="button"
    >+</button
  >
</div>
<Modal bind:active="{showAdd}">
  <h1>Legg til gruppe</h1>
  <form on:submit|preventDefault="{toggleGroupAddModal}">
    <label for="groupname">
      Gruppenavn:
      <input type="text" name="groupname" required /></label
    >
    <br />
    Private or public group?
    <label><input type="radio" name="grouptype" checked="{true}" />Privat</label
    >
    <label><input type="radio" name="grouptype" />Offentlig</label>
    <br />
    <label> Legg til gruppemedlem <input type="text" name="addmember" /></label>
    <Button on:click="{addGroupMember}">Legg til</Button>
    <br />
    <Button on:click="{addGroup}">Opprett gruppe</Button>
  </form>
</Modal>

<style lang="less">
  @import "../../variables.less";
  .addGroup-container {
    position: relative;
    height: 80px;
    width: 80px;
    border-radius: 100%;
    background-color: @white;
    margin: 5px;
    box-shadow: 0 8px #c9c9c9;
    margin: 5px;
  }
  .addGroup {
    font-size: 70px;
  }

  button {
    border: none;
    margin: 0 auto;
    text-decoration: none;
    color: @secondary;
    background: none;
    height: 100%;
    width: 100%;
    outline: none;
    transition: background-color 0.6s ease;
    border-radius: 100%;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  button:hover {
    background-color: @secondaryLighten30;
  }
</style>
