<script lang="ts">
  export let disabled = false;
  export let color: "primary" | "secondary" | "success" | "danger" = "primary";
  export let variant: "normal" | "outline" = "normal";
</script>

<button on:click class:disabled class="{color} {variant}">
  <slot />
</button>

<style lang="less">
  @import "../styles/variables.less";

  button {
    appearance: none;
    background: @primary;
    border: 1px solid black;
    color: @white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    &:not(.disabled):hover {
      background: @primaryLighten15;
    }
  }

  .disabled {
    background: @grayLighten30;
    color: @grayLighten60;
    box-shadow: none;
    border-color: @grayLighten90;
    cursor: not-allowed;
  }

  .secondary {
    background: @secondary;
    &:not(.disabled):hover {
      background: @secondaryLighten15;
    }
  }

  .success {
    background: @success;
    &:not(.disabled):hover {
      background: @successDarken15;
    }
  }
  .danger {
    background: @error;
    &:not(.disabled):hover {
      background: @errorDarken15;
    }
  }

  .outline.success {
    background: transparent;
    color: @success;
    border-color: @success;
    &:not(.disabled):hover {
      background: @grayLighten60;
    }
  }

  .outline.primary {
    background: transparent;
    color: @primary;
    border-color: @primary;
    &:not(.disabled):hover {
      background: @grayLighten60;
    }
  }

  .outline.secondary {
    background: transparent;
    color: @secondary;
    border-color: @secondary;
    &:not(.disabled):hover {
      background: @grayLighten60;
    }
  }

  .outline.danger {
    background: transparent;
    color: @error;
    border-color: @error;
    &:not(.disabled):hover {
      background: @grayLighten60;
    }
  }
</style>
