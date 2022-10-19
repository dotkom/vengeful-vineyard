<script lang="ts">
  import { showPaid, showInactive } from "../../../stores/users";

  let showPaidCB = false;
  let showInactiveCB = false;

  $: showPaid.set(showPaidCB);
  $: showInactive.set(showInactiveCB);
</script>

<div class="wrapper">
  <div class="form-control">
    <label class="cursor-pointer label">
      <input
        type="checkbox"
        bind:checked="{showPaidCB}"
        class="checkbox checkbox-secondary"
      />
      <span class="label-text">Vis betalte straffer</span>
    </label>
  </div>
  <div class="form-control">
    <label class="cursor-pointer label">
      <input
        type="checkbox"
        bind:checked="{showInactiveCB}"
        class="checkbox checkbox-secondary"
      />
      <span class="label-text">Vis inaktive medlemmer</span>
    </label>
  </div>
</div>

<style lang="less">
  .wrapper {
    padding: 0rem 1.5rem;
  }

  .label-text {
    color: #eeeeee;
    font-size: 16px;
    float: left;
    padding-left: 5px;
  }

  .label {
    display: flex;
    justify-content: left;
    width: fit-content;
  }

  .checkbox {
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 6px;
  }
</style>
