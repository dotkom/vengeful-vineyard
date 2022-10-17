<script lang="ts">
  import { term } from "../../stores/users";

  let val = "";

  $: term.set(val);
</script>

<div class="form-control">
  <label for="user" class="label">
    <span class="label-text">Finn bruker</span>
  </label>
  <input
    type="text"
    id="user"
    placeholder="Navn"
    class="input input-bordered"
    bind:value="{val}"
  />
</div>

<style lang="less">
  .form-control {
    padding: 0rem 1.5rem;
  }

  .label-text {
    color: #eeeeee;
    font-size: 20px;
    float: left;
  }

  .input-bordered {
    background-color: white;
  }
</style>
