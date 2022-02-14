<script lang="ts">
  let showPaid = false;
  let showInactive = false;
</script>

<div>
  <div class="form-control">
    <label class="cursor-pointer label">
      <input
        type="checkbox"
        bind:checked="{showPaid}"
        class="checkbox checkbox-secondary"
      />
      <span class="label-text">Vis betalte straffer</span>
    </label>
  </div>
  <div class="form-control">
    <label class="cursor-pointer label">
      <input
        type="checkbox"
        bind:checked="{showInactive}"
        class="checkbox checkbox-secondary"
      />
      <span class="label-text">Vis inaktive medlemmer</span>
    </label>
  </div>
</div>

<style lang="less">
  .label-text {
    color: #eeeeee;
    font-size: 20px;
    float: left;
    padding-left: 5px;
  }

  .label {
    display: flex;
    justify-content: left;
    width: fit-content;
  }
</style>
